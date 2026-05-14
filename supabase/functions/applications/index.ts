import {
  handleCors,
  jsonResponse,
  errorResponse,
} from "../_shared/cors.ts";
import {
  getAuthUser,
  requireRole,
  getServiceClient,
} from "../_shared/auth.ts";

function generateCouponCode(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1 to avoid confusion
  let suffix = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 6; i++) {
    suffix += chars[bytes[i] % chars.length];
  }
  return `${prefix}-${suffix}`;
}

function generateCreatorSlug(dealSlug: string, creatorName: string): string {
  const base = creatorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  const rand = crypto.randomUUID().slice(0, 4);
  return `${dealSlug}-${base}-${rand}`;
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const requestId = crypto.randomUUID();
  const db = getServiceClient();

  try {
    // ---- POST: creator applies to a deal ----
    if (req.method === "POST") {
      const user = await getAuthUser(req);
      if (!user) {
        return errorResponse("unauthorized", "Authorization required", 401, requestId);
      }

      const profile = await requireRole(user, "creator", db);
      if (!profile) {
        return errorResponse("forbidden", "Only creator accounts can apply to deals", 403, requestId);
      }

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return errorResponse("invalid_body", "Request body must be valid JSON", 400, requestId);
      }

      const dealId = body.deal_id;
      if (typeof dealId !== "string" || dealId.trim().length === 0) {
        return errorResponse("validation", "deal_id is required", 400, requestId);
      }

      // Verify deal exists and is active
      const { data: deal, error: dealErr } = await db
        .from("deals")
        .select("id, brand_id, status, slug, coupon_prefix")
        .eq("id", dealId)
        .single();

      if (dealErr || !deal) {
        return errorResponse("not_found", "Deal not found", 404, requestId);
      }

      if (deal.status !== "active") {
        return errorResponse("conflict", "This deal is not currently accepting applications", 409, requestId);
      }

      // Check if creator already applied (idempotent guard)
      const { data: existingApp } = await db
        .from("applications")
        .select("id, status")
        .eq("deal_id", dealId)
        .eq("creator_id", user.id)
        .maybeSingle();

      if (existingApp) {
        return errorResponse(
          "conflict",
          `You have already applied to this deal (status: ${existingApp.status})`,
          409,
          requestId,
        );
      }

      const creatorMessage =
        typeof body.creator_message === "string" ? body.creator_message.trim() : null;

      const { data: application, error: insertErr } = await db
        .from("applications")
        .insert({
          deal_id: dealId,
          creator_id: user.id,
          status: "pending",
          creator_message: creatorMessage,
        })
        .select("*")
        .single();

      if (insertErr) {
        console.error(`[${requestId}] Insert application error: ${insertErr.message}`);
        return errorResponse("db_error", "Failed to create application", 500, requestId);
      }

      console.log(
        `[${requestId}] Application created: ${application.id} by creator ${user.id} for deal ${dealId}`,
      );

      return jsonResponse({ request_id: requestId, application }, 201);
    }

    // ---- PATCH: brand approves or rejects an application ----
    if (req.method === "PATCH") {
      const user = await getAuthUser(req);
      if (!user) {
        return errorResponse("unauthorized", "Authorization required", 401, requestId);
      }

      const profile = await requireRole(user, "brand", db);
      if (!profile) {
        return errorResponse("forbidden", "Only brand accounts can manage applications", 403, requestId);
      }

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return errorResponse("invalid_body", "Request body must be valid JSON", 400, requestId);
      }

      const applicationId = body.id;
      if (typeof applicationId !== "string" || applicationId.trim().length === 0) {
        return errorResponse("validation", "id (application id) is required", 400, requestId);
      }

      const newStatus = body.status;
      if (newStatus !== "approved" && newStatus !== "rejected") {
        return errorResponse(
          "validation",
          "status must be 'approved' or 'rejected'",
          400,
          requestId,
        );
      }

      // Fetch the application and verify deal ownership
      const { data: application, error: appErr } = await db
        .from("applications")
        .select("id, deal_id, creator_id, status")
        .eq("id", applicationId)
        .single();

      if (appErr || !application) {
        return errorResponse("not_found", "Application not found", 404, requestId);
      }

      // Only allow transitions from pending
      if (application.status !== "pending") {
        return errorResponse(
          "conflict",
          `Application is already '${application.status}' and cannot be changed`,
          409,
          requestId,
        );
      }

      // Verify the brand owns the deal
      const { data: deal, error: dealErr } = await db
        .from("deals")
        .select("id, brand_id, slug, coupon_prefix")
        .eq("id", application.deal_id)
        .single();

      if (dealErr || !deal) {
        return errorResponse("not_found", "Associated deal not found", 404, requestId);
      }

      if (deal.brand_id !== user.id) {
        return errorResponse(
          "forbidden",
          "You can only manage applications for your own deals",
          403,
          requestId,
        );
      }

      const updates: Record<string, unknown> = { status: newStatus };

      if (newStatus === "approved") {
        // Generate unique coupon code
        const couponPrefix = deal.coupon_prefix ?? "DEAL";
        let couponCode = generateCouponCode(couponPrefix);

        // Ensure coupon code uniqueness (retry up to 5 times)
        for (let attempt = 0; attempt < 5; attempt++) {
          const { data: existingCoupon } = await db
            .from("applications")
            .select("id")
            .eq("coupon_code", couponCode)
            .maybeSingle();

          if (!existingCoupon) break;
          couponCode = generateCouponCode(couponPrefix);
        }

        // Get creator display name for slug generation
        const { data: creatorProfile } = await db
          .from("profiles")
          .select("display_name")
          .eq("id", application.creator_id)
          .single();

        const creatorName = creatorProfile?.display_name ?? "creator";
        const creatorSlug = generateCreatorSlug(deal.slug ?? "deal", creatorName);

        updates.coupon_code = couponCode;
        updates.creator_slug = creatorSlug;

        if (typeof body.brand_message === "string") {
          updates.brand_message = body.brand_message.trim();
        }
      }

      if (newStatus === "rejected") {
        if (typeof body.rejection_reason !== "string" || body.rejection_reason.trim().length === 0) {
          return errorResponse(
            "validation",
            "rejection_reason is required when rejecting an application",
            400,
            requestId,
          );
        }
        updates.brand_message = body.rejection_reason.trim();
      }

      const { data: updatedApp, error: updateErr } = await db
        .from("applications")
        .update(updates)
        .eq("id", applicationId)
        .select("*")
        .single();

      if (updateErr) {
        console.error(`[${requestId}] Update application error: ${updateErr.message}`);
        return errorResponse("db_error", "Failed to update application", 500, requestId);
      }

      console.log(
        `[${requestId}] Application ${applicationId} ${newStatus} by brand ${user.id}`,
      );

      return jsonResponse({ request_id: requestId, application: updatedApp });
    }

    // ---- GET: list applications ----
    if (req.method === "GET") {
      const user = await getAuthUser(req);
      if (!user) {
        return errorResponse("unauthorized", "Authorization required", 401, requestId);
      }

      const url = new URL(req.url);
      const limitParam = parseInt(url.searchParams.get("limit") ?? "20", 10);
      const offsetParam = parseInt(url.searchParams.get("offset") ?? "0", 10);
      const limit = Math.max(1, Math.min(limitParam, 50));
      const offset = Math.max(0, offsetParam);
      const statusFilter = url.searchParams.get("status");
      const dealIdFilter = url.searchParams.get("deal_id");

      // Determine role to scope the query
      const { data: userProfile, error: profileErr } = await db
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (profileErr || !userProfile) {
        return errorResponse("profile_not_found", "User profile not found", 404, requestId);
      }

      let query = db
        .from("applications")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (userProfile.role === "creator") {
        // Creators see only their own applications
        query = query.eq("creator_id", user.id);
      } else if (userProfile.role === "brand") {
        // Brands see applications for their deals
        // First get all their deal IDs
        const { data: brandDeals } = await db
          .from("deals")
          .select("id")
          .eq("brand_id", user.id);

        if (!brandDeals || brandDeals.length === 0) {
          return jsonResponse({
            request_id: requestId,
            applications: [],
            total: 0,
            limit,
            offset,
          });
        }

        const dealIds = brandDeals.map((d) => d.id);
        query = query.in("deal_id", dealIds);
      }

      if (statusFilter) {
        const validStatuses = ["pending", "approved", "rejected", "withdrawn"];
        if (validStatuses.includes(statusFilter)) {
          query = query.eq("status", statusFilter);
        }
      }

      if (dealIdFilter) {
        query = query.eq("deal_id", dealIdFilter);
      }

      const { data: applications, count, error: listErr } = await query;

      if (listErr) {
        console.error(`[${requestId}] List applications error: ${listErr.message}`);
        return errorResponse("db_error", "Failed to list applications", 500, requestId);
      }

      return jsonResponse({
        request_id: requestId,
        applications: applications ?? [],
        total: count ?? 0,
        limit,
        offset,
      });
    }

    return errorResponse("method_not_allowed", "Method not allowed", 405, requestId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[${requestId}] Unhandled error: ${msg}`);
    return errorResponse("internal_error", "An unexpected error occurred", 500, requestId);
  }
});
