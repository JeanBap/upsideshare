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

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const requestId = crypto.randomUUID();
  const url = new URL(req.url);
  const db = getServiceClient();

  try {
    // ---- GET: list deals or get single deal by slug ----
    if (req.method === "GET") {
      const slugParam = url.searchParams.get("slug");

      if (slugParam) {
        // Single deal by slug (public)
        const { data: deal, error } = await db
          .from("deals")
          .select("*")
          .eq("slug", slugParam)
          .single();

        if (error || !deal) {
          return errorResponse("not_found", "Deal not found", 404, requestId);
        }

        return jsonResponse({ request_id: requestId, deal });
      }

      // List active deals with optional filters and pagination
      const search = url.searchParams.get("q") ?? "";
      const limitParam = parseInt(url.searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
      const offsetParam = parseInt(url.searchParams.get("offset") ?? "0", 10);

      const limit = Math.max(1, Math.min(limitParam, MAX_LIMIT));
      const offset = Math.max(0, offsetParam);

      let query = db
        .from("deals")
        .select("*", { count: "exact" })
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (search.trim().length > 0) {
        // Full-text search on title and description
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      const { data: deals, count, error } = await query;

      if (error) {
        console.error(`[${requestId}] List deals error: ${error.message}`);
        return errorResponse("db_error", "Failed to list deals", 500, requestId);
      }

      return jsonResponse({
        request_id: requestId,
        deals: deals ?? [],
        total: count ?? 0,
        limit,
        offset,
      });
    }

    // ---- POST: create a new deal ----
    if (req.method === "POST") {
      const user = await getAuthUser(req);
      if (!user) {
        return errorResponse("unauthorized", "Authorization required", 401, requestId);
      }

      const profile = await requireRole(user, "brand", db);
      if (!profile) {
        return errorResponse("forbidden", "Only brand accounts can create deals", 403, requestId);
      }

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return errorResponse("invalid_body", "Request body must be valid JSON", 400, requestId);
      }

      // Validate required fields
      const title = body.title;
      if (typeof title !== "string" || title.trim().length === 0) {
        return errorResponse("validation", "title is required", 400, requestId);
      }

      const revenueSharePct = body.revenue_share_pct;
      if (
        typeof revenueSharePct !== "number" ||
        revenueSharePct < 1 ||
        revenueSharePct > 50
      ) {
        return errorResponse(
          "validation",
          "revenue_share_pct must be a number between 1 and 50",
          400,
          requestId,
        );
      }

      const hasEquity = body.has_equity_component === true;
      let equityPct: number | null = null;
      if (hasEquity) {
        equityPct = typeof body.equity_pct === "number" ? body.equity_pct : null;
        if (equityPct === null || equityPct < 0 || equityPct > 10) {
          return errorResponse(
            "validation",
            "equity_pct must be between 0 and 10 when has_equity_component is true",
            400,
            requestId,
          );
        }
      }

      // Generate slug from title if not provided
      let slug: string;
      if (typeof body.slug === "string" && body.slug.trim().length > 0) {
        slug = slugify(body.slug);
      } else {
        slug = slugify(title as string);
      }

      // Ensure slug uniqueness by appending random suffix if collision
      const { data: existing } = await db
        .from("deals")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        const suffix = crypto.randomUUID().slice(0, 6);
        slug = `${slug}-${suffix}`;
      }

      const newDeal: Record<string, unknown> = {
        brand_id: user.id,
        title: (title as string).trim(),
        description: typeof body.description === "string" ? body.description.trim() : null,
        product_url: typeof body.product_url === "string" ? body.product_url.trim() : null,
        revenue_share_pct: revenueSharePct,
        has_equity_component: hasEquity,
        equity_pct: equityPct,
        status: "draft",
        slug,
        coupon_prefix:
          typeof body.coupon_prefix === "string" && body.coupon_prefix.trim().length > 0
            ? body.coupon_prefix.trim().toUpperCase()
            : (title as string).slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "X"),
        starts_at: typeof body.starts_at === "string" ? body.starts_at : null,
        expires_at: typeof body.expires_at === "string" ? body.expires_at : null,
      };

      const { data: deal, error: insertErr } = await db
        .from("deals")
        .insert(newDeal)
        .select("*")
        .single();

      if (insertErr) {
        console.error(`[${requestId}] Insert deal error: ${insertErr.message}`);
        if (insertErr.message.includes("unique") || insertErr.message.includes("duplicate")) {
          return errorResponse("conflict", "A deal with that slug already exists", 409, requestId);
        }
        return errorResponse("db_error", "Failed to create deal", 500, requestId);
      }

      console.log(`[${requestId}] Deal created: ${deal.id} by brand ${user.id}`);
      return jsonResponse({ request_id: requestId, deal }, 201);
    }

    // ---- PATCH: update a deal ----
    if (req.method === "PATCH") {
      const user = await getAuthUser(req);
      if (!user) {
        return errorResponse("unauthorized", "Authorization required", 401, requestId);
      }

      const profile = await requireRole(user, "brand", db);
      if (!profile) {
        return errorResponse("forbidden", "Only brand accounts can update deals", 403, requestId);
      }

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return errorResponse("invalid_body", "Request body must be valid JSON", 400, requestId);
      }

      const dealId = body.id;
      if (typeof dealId !== "string" || dealId.trim().length === 0) {
        return errorResponse("validation", "id is required to update a deal", 400, requestId);
      }

      // Verify ownership
      const { data: existingDeal, error: fetchErr } = await db
        .from("deals")
        .select("id, brand_id")
        .eq("id", dealId)
        .single();

      if (fetchErr || !existingDeal) {
        return errorResponse("not_found", "Deal not found", 404, requestId);
      }

      if (existingDeal.brand_id !== user.id) {
        return errorResponse("forbidden", "You can only update your own deals", 403, requestId);
      }

      // Build update payload with validation
      const updates: Record<string, unknown> = {};

      if (body.title !== undefined) {
        if (typeof body.title !== "string" || body.title.trim().length === 0) {
          return errorResponse("validation", "title must be a non-empty string", 400, requestId);
        }
        updates.title = body.title.trim();
      }

      if (body.description !== undefined) {
        updates.description =
          typeof body.description === "string" ? body.description.trim() : null;
      }

      if (body.product_url !== undefined) {
        updates.product_url =
          typeof body.product_url === "string" ? body.product_url.trim() : null;
      }

      if (body.revenue_share_pct !== undefined) {
        if (
          typeof body.revenue_share_pct !== "number" ||
          body.revenue_share_pct < 1 ||
          body.revenue_share_pct > 50
        ) {
          return errorResponse(
            "validation",
            "revenue_share_pct must be between 1 and 50",
            400,
            requestId,
          );
        }
        updates.revenue_share_pct = body.revenue_share_pct;
      }

      if (body.has_equity_component !== undefined) {
        updates.has_equity_component = body.has_equity_component === true;
      }

      if (body.equity_pct !== undefined) {
        const checkEquity =
          body.has_equity_component === true ||
          (body.has_equity_component === undefined && body.equity_pct !== null);

        if (checkEquity) {
          if (typeof body.equity_pct !== "number" || body.equity_pct < 0 || body.equity_pct > 10) {
            return errorResponse(
              "validation",
              "equity_pct must be between 0 and 10",
              400,
              requestId,
            );
          }
        }
        updates.equity_pct = body.equity_pct;
      }

      if (body.status !== undefined) {
        const validStatuses = ["draft", "active", "paused", "completed", "expired"];
        if (!validStatuses.includes(body.status as string)) {
          return errorResponse(
            "validation",
            `status must be one of: ${validStatuses.join(", ")}`,
            400,
            requestId,
          );
        }
        updates.status = body.status;
      }

      if (body.slug !== undefined) {
        if (typeof body.slug !== "string" || body.slug.trim().length === 0) {
          return errorResponse("validation", "slug must be a non-empty string", 400, requestId);
        }
        const newSlug = slugify(body.slug);
        // Check uniqueness (excluding current deal)
        const { data: slugConflict } = await db
          .from("deals")
          .select("id")
          .eq("slug", newSlug)
          .neq("id", dealId)
          .maybeSingle();

        if (slugConflict) {
          return errorResponse("conflict", "A deal with that slug already exists", 409, requestId);
        }
        updates.slug = newSlug;
      }

      if (body.coupon_prefix !== undefined) {
        updates.coupon_prefix =
          typeof body.coupon_prefix === "string"
            ? body.coupon_prefix.trim().toUpperCase()
            : null;
      }

      if (body.starts_at !== undefined) {
        updates.starts_at = typeof body.starts_at === "string" ? body.starts_at : null;
      }

      if (body.expires_at !== undefined) {
        updates.expires_at = typeof body.expires_at === "string" ? body.expires_at : null;
      }

      if (Object.keys(updates).length === 0) {
        return errorResponse("validation", "No valid fields to update", 400, requestId);
      }

      const { data: updatedDeal, error: updateErr } = await db
        .from("deals")
        .update(updates)
        .eq("id", dealId)
        .select("*")
        .single();

      if (updateErr) {
        console.error(`[${requestId}] Update deal error: ${updateErr.message}`);
        return errorResponse("db_error", "Failed to update deal", 500, requestId);
      }

      console.log(`[${requestId}] Deal updated: ${dealId} by brand ${user.id}`);
      return jsonResponse({ request_id: requestId, deal: updatedDeal });
    }

    return errorResponse("method_not_allowed", "Method not allowed", 405, requestId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[${requestId}] Unhandled error: ${msg}`);
    return errorResponse("internal_error", "An unexpected error occurred", 500, requestId);
  }
});
