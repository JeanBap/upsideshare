import {
  corsResponse,
  jsonResponse,
  errorResponse,
} from "../_shared/cors.ts";
import {
  getAuthUser,
  requireRole,
  createServiceClient,
} from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return corsResponse();

  const requestId =
    req.headers.get("x-request-id") ?? crypto.randomUUID();
  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  // Last segment after /ledger/ determines sub-route
  const action = pathSegments[pathSegments.length - 1];

  try {
    // ----------------------------------------------------------------
    // GET /ledger -- list entries for the authenticated user
    // ----------------------------------------------------------------
    if (req.method === "GET") {
      const user = await getAuthUser(req);
      if (!user) {
        return errorResponse(
          "unauthorized",
          "Valid authorization token required",
          401,
          requestId,
        );
      }

      const db = createServiceClient();

      // Determine the user's role
      const { data: profile, error: profileErr } = await db
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (profileErr || !profile) {
        return errorResponse(
          "profile_not_found",
          "User profile not found",
          404,
          requestId,
        );
      }

      // Build query based on role
      let query = db.from("ledger_entries").select("*");

      if (profile.role === "brand") {
        // Brands see entries for deals they own
        const { data: dealIds } = await db
          .from("deals")
          .select("id")
          .eq("brand_id", user.id);
        const ids = (dealIds ?? []).map(
          (d: { id: string }) => d.id,
        );
        if (ids.length === 0) {
          return jsonResponse({
            request_id: requestId,
            entries: [],
          });
        }
        query = query.in("deal_id", ids);
      } else if (profile.role === "creator") {
        query = query.eq("creator_id", user.id);
      } else {
        return errorResponse(
          "forbidden",
          "Unknown role",
          403,
          requestId,
        );
      }

      // Optional filters
      const dealIdFilter = url.searchParams.get("deal_id");
      if (dealIdFilter) {
        query = query.eq("deal_id", dealIdFilter);
      }

      const periodStart = url.searchParams.get("period_start");
      if (periodStart) {
        query = query.gte("period_start", periodStart);
      }

      const periodEnd = url.searchParams.get("period_end");
      if (periodEnd) {
        query = query.lte("period_end", periodEnd);
      }

      query = query.order("period_start", { ascending: false });

      const { data: entries, error: queryErr } = await query;

      if (queryErr) {
        console.error(
          `[${requestId}] Ledger query error: ${queryErr.message}`,
        );
        return errorResponse(
          "db_error",
          "Failed to fetch ledger entries",
          500,
          requestId,
        );
      }

      return jsonResponse({
        request_id: requestId,
        entries: entries ?? [],
      });
    }

    // ----------------------------------------------------------------
    // POST /ledger/calculate -- compute monthly ledger from attributed_sales
    // ----------------------------------------------------------------
    if (req.method === "POST" && action === "calculate") {
      const user = await getAuthUser(req);
      if (!user) {
        return errorResponse(
          "unauthorized",
          "Valid authorization token required",
          401,
          requestId,
        );
      }

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return errorResponse(
          "invalid_body",
          "Request body must be valid JSON",
          400,
          requestId,
        );
      }

      // period_start and period_end define the month to calculate
      const periodStart = body.period_start as string | undefined;
      const periodEnd = body.period_end as string | undefined;

      if (!periodStart || !periodEnd) {
        return errorResponse(
          "missing_field",
          "period_start and period_end are required (ISO date strings)",
          400,
          requestId,
        );
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(periodStart) || !dateRegex.test(periodEnd)) {
        return errorResponse(
          "invalid_field",
          "period_start and period_end must be YYYY-MM-DD format",
          400,
          requestId,
        );
      }

      const db = createServiceClient();

      const platformFeeRate = parseFloat(
        Deno.env.get("PLATFORM_FEE_RATE") ?? "0.05",
      );

      // Fetch all attributed sales in the period
      const { data: sales, error: salesErr } = await db
        .from("attributed_sales")
        .select(
          "deal_id, creator_id, sale_amount_cents, commission_cents",
        )
        .gte("sale_date", periodStart)
        .lt("sale_date", periodEnd);

      if (salesErr) {
        console.error(
          `[${requestId}] Sales query error: ${salesErr.message}`,
        );
        return errorResponse(
          "db_error",
          "Failed to query attributed sales",
          500,
          requestId,
        );
      }

      if (!sales || sales.length === 0) {
        return jsonResponse({
          request_id: requestId,
          entries_upserted: 0,
          message: "No attributed sales found for the period",
        });
      }

      // Group by deal_id + creator_id
      interface Bucket {
        total_sales_cents: number;
        commission_owed_cents: number;
      }

      const buckets = new Map<string, Bucket>();

      for (const sale of sales) {
        const key = `${sale.deal_id}::${sale.creator_id}`;
        const existing = buckets.get(key);
        if (existing) {
          existing.total_sales_cents += sale.sale_amount_cents;
          existing.commission_owed_cents += sale.commission_cents;
        } else {
          buckets.set(key, {
            total_sales_cents: sale.sale_amount_cents,
            commission_owed_cents: sale.commission_cents,
          });
        }
      }

      // Upsert ledger entries (idempotent on deal_id + creator_id + period_start)
      let upsertedCount = 0;
      const errors: string[] = [];

      for (const [key, bucket] of buckets) {
        const [dealId, creatorId] = key.split("::");
        const platformFeeCents = Math.round(
          bucket.commission_owed_cents * platformFeeRate,
        );

        const { error: upsertErr } = await db
          .from("ledger_entries")
          .upsert(
            {
              deal_id: dealId,
              creator_id: creatorId,
              period_start: periodStart,
              period_end: periodEnd,
              total_sales_cents: bucket.total_sales_cents,
              commission_owed_cents: bucket.commission_owed_cents,
              platform_fee_cents: platformFeeCents,
              brand_marked_paid: false,
              creator_confirmed: false,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "deal_id,creator_id,period_start",
              ignoreDuplicates: false,
            },
          );

        if (upsertErr) {
          console.error(
            `[${requestId}] Upsert error for ${key}: ${upsertErr.message}`,
          );
          errors.push(key);
        } else {
          upsertedCount++;
        }
      }

      console.log(
        `[${requestId}] Ledger calculate: ${upsertedCount} entries upserted, ${errors.length} errors`,
      );

      return jsonResponse({
        request_id: requestId,
        entries_upserted: upsertedCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    // ----------------------------------------------------------------
    // PATCH /ledger/mark-paid -- brand marks entry as paid
    // ----------------------------------------------------------------
    if (req.method === "PATCH" && action === "mark-paid") {
      const user = await getAuthUser(req);
      if (!user) {
        return errorResponse(
          "unauthorized",
          "Valid authorization token required",
          401,
          requestId,
        );
      }

      const db = createServiceClient();

      const brandProfile = await requireRole(user, "brand", db);
      if (!brandProfile) {
        return errorResponse(
          "forbidden",
          "Only brand accounts can mark entries as paid",
          403,
          requestId,
        );
      }

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return errorResponse(
          "invalid_body",
          "Request body must be valid JSON",
          400,
          requestId,
        );
      }

      const ledgerEntryId = body.ledger_entry_id as string | undefined;
      if (!ledgerEntryId) {
        return errorResponse(
          "missing_field",
          "ledger_entry_id is required",
          400,
          requestId,
        );
      }

      // Fetch the entry and verify ownership via the deal
      const { data: entry, error: entryErr } = await db
        .from("ledger_entries")
        .select("id, deal_id, brand_marked_paid")
        .eq("id", ledgerEntryId)
        .single();

      if (entryErr || !entry) {
        return errorResponse(
          "not_found",
          "Ledger entry not found",
          404,
          requestId,
        );
      }

      // Verify the brand owns the deal
      const { data: deal, error: dealErr } = await db
        .from("deals")
        .select("id, brand_id")
        .eq("id", entry.deal_id)
        .eq("brand_id", user.id)
        .single();

      if (dealErr || !deal) {
        return errorResponse(
          "forbidden",
          "You do not own the deal associated with this ledger entry",
          403,
          requestId,
        );
      }

      // Idempotent: if already marked paid, return success
      if (entry.brand_marked_paid) {
        return jsonResponse({
          request_id: requestId,
          already_marked: true,
          ledger_entry_id: ledgerEntryId,
        });
      }

      const now = new Date().toISOString();
      const { error: updateErr } = await db
        .from("ledger_entries")
        .update({
          brand_marked_paid: true,
          paid_at: now,
          updated_at: now,
        })
        .eq("id", ledgerEntryId);

      if (updateErr) {
        console.error(
          `[${requestId}] Mark-paid update error: ${updateErr.message}`,
        );
        return errorResponse(
          "db_error",
          "Failed to mark entry as paid",
          500,
          requestId,
        );
      }

      console.log(
        `[${requestId}] Brand ${user.id} marked ledger entry ${ledgerEntryId} as paid`,
      );

      return jsonResponse({
        request_id: requestId,
        ledger_entry_id: ledgerEntryId,
        brand_marked_paid: true,
        paid_at: now,
      });
    }

    // ----------------------------------------------------------------
    // PATCH /ledger/confirm -- creator confirms receipt
    // ----------------------------------------------------------------
    if (req.method === "PATCH" && action === "confirm") {
      const user = await getAuthUser(req);
      if (!user) {
        return errorResponse(
          "unauthorized",
          "Valid authorization token required",
          401,
          requestId,
        );
      }

      const db = createServiceClient();

      const creatorProfile = await requireRole(user, "creator", db);
      if (!creatorProfile) {
        return errorResponse(
          "forbidden",
          "Only creator accounts can confirm receipt",
          403,
          requestId,
        );
      }

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return errorResponse(
          "invalid_body",
          "Request body must be valid JSON",
          400,
          requestId,
        );
      }

      const ledgerEntryId = body.ledger_entry_id as string | undefined;
      if (!ledgerEntryId) {
        return errorResponse(
          "missing_field",
          "ledger_entry_id is required",
          400,
          requestId,
        );
      }

      // Fetch entry and verify creator owns it
      const { data: entry, error: entryErr } = await db
        .from("ledger_entries")
        .select(
          "id, creator_id, brand_marked_paid, creator_confirmed",
        )
        .eq("id", ledgerEntryId)
        .eq("creator_id", user.id)
        .single();

      if (entryErr || !entry) {
        return errorResponse(
          "not_found",
          "Ledger entry not found or you are not the creator on this entry",
          404,
          requestId,
        );
      }

      if (!entry.brand_marked_paid) {
        return errorResponse(
          "precondition_failed",
          "Brand must mark the entry as paid before creator can confirm",
          409,
          requestId,
        );
      }

      // Idempotent: if already confirmed, return success
      if (entry.creator_confirmed) {
        return jsonResponse({
          request_id: requestId,
          already_confirmed: true,
          ledger_entry_id: ledgerEntryId,
        });
      }

      const now = new Date().toISOString();
      const { error: updateErr } = await db
        .from("ledger_entries")
        .update({
          creator_confirmed: true,
          updated_at: now,
        })
        .eq("id", ledgerEntryId);

      if (updateErr) {
        console.error(
          `[${requestId}] Confirm update error: ${updateErr.message}`,
        );
        return errorResponse(
          "db_error",
          "Failed to confirm receipt",
          500,
          requestId,
        );
      }

      console.log(
        `[${requestId}] Creator ${user.id} confirmed receipt for ledger entry ${ledgerEntryId}`,
      );

      return jsonResponse({
        request_id: requestId,
        ledger_entry_id: ledgerEntryId,
        creator_confirmed: true,
      });
    }

    return errorResponse(
      "not_found",
      "Unknown route. Supported: GET /ledger, POST /ledger/calculate, PATCH /ledger/mark-paid, PATCH /ledger/confirm",
      404,
      requestId,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[${requestId}] Unhandled error: ${msg}`);
    return errorResponse(
      "internal_error",
      "An unexpected error occurred",
      500,
      requestId,
    );
  }
});
