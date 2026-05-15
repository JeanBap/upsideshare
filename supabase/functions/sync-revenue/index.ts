import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/auth.ts";
import Stripe from "https://esm.sh/stripe@14";

const PLATFORM_FEE_RATE = 0.05; // 5% of commission

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const requestId = crypto.randomUUID();

  if (req.method !== "POST") {
    return errorResponse("method_not_allowed", "Only POST is accepted", 405, requestId);
  }

  try {
    const db = createServiceClient();

    // Verify shared secret for cron authentication (read from app_secrets table)
    const { data: secretRow, error: secretErr } = await db
      .from("app_secrets")
      .select("value")
      .eq("key", "CRON_SECRET")
      .single();

    if (secretErr || !secretRow?.value) {
      console.error(`[${requestId}] CRON_SECRET not found in app_secrets`);
      return errorResponse("server_error", "Cron secret not configured", 500, requestId);
    }

    const providedSecret = req.headers.get("x-cron-secret");
    if (providedSecret !== secretRow.value) {
      return errorResponse("unauthorized", "Invalid cron secret", 401, requestId);
    }

    // Fetch all brands with active Stripe connections
    const { data: brands, error: brandsErr } = await db
      .from("profiles")
      .select("id, stripe_account_id, stripe_read_key_encrypted, stripe_connected_at")
      .eq("role", "brand")
      .not("stripe_connected_at", "is", null);

    if (brandsErr) {
      console.error(`[${requestId}] Error fetching brands: ${brandsErr.message}`);
      return errorResponse("db_error", "Failed to fetch brand profiles", 500, requestId);
    }

    if (!brands || brands.length === 0) {
      console.log(`[${requestId}] No brands with Stripe connected`);
      return jsonResponse({ request_id: requestId, synced: 0, brands_processed: 0 });
    }

    const encryptionPrefix = Deno.env.get("ENCRYPTION_PREFIX") ?? "enc_v1:";
    let totalSynced = 0;
    let brandsProcessed = 0;

    for (const brand of brands) {
      try {
        // Decrypt the read key
        const encryptedKey: string = brand.stripe_read_key_encrypted ?? "";
        if (!encryptedKey.startsWith(encryptionPrefix)) {
          console.error(`[${requestId}] Brand ${brand.id}: invalid encrypted key format`);
          continue;
        }
        const stripeReadKey = atob(encryptedKey.slice(encryptionPrefix.length));

        // Determine sync window: last synced_at for this brand, or stripe_connected_at
        const { data: lastSale } = await db
          .from("attributed_sales")
          .select("synced_at")
          .eq("brand_id", brand.id)
          .order("synced_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const sinceTimestamp = lastSale?.synced_at ?? brand.stripe_connected_at;
        const sinceUnix = Math.floor(new Date(sinceTimestamp).getTime() / 1000);

        // Fetch active deals for this brand to build coupon-to-deal mapping
        const { data: deals, error: dealsErr } = await db
          .from("deals")
          .select("id, revenue_share_pct, coupon_prefix, slug")
          .eq("brand_id", brand.id)
          .in("status", ["active", "completed"]);

        if (dealsErr || !deals || deals.length === 0) {
          console.log(`[${requestId}] Brand ${brand.id}: no active deals, skipping`);
          continue;
        }

        // Build lookup maps: coupon_code -> application, creator_slug -> application
        const dealIds = deals.map((d) => d.id);
        const { data: applications } = await db
          .from("applications")
          .select("id, deal_id, creator_id, coupon_code, creator_slug")
          .in("deal_id", dealIds)
          .eq("status", "approved");

        if (!applications || applications.length === 0) {
          console.log(`[${requestId}] Brand ${brand.id}: no approved applications, skipping`);
          continue;
        }

        // Map coupon codes (lowercased) to application info
        const couponMap = new Map<
          string,
          { deal_id: string; creator_id: string; coupon_code: string }
        >();
        const slugMap = new Map<
          string,
          { deal_id: string; creator_id: string; creator_slug: string }
        >();

        for (const app of applications) {
          if (app.coupon_code) {
            couponMap.set(app.coupon_code.toLowerCase(), {
              deal_id: app.deal_id,
              creator_id: app.creator_id,
              coupon_code: app.coupon_code,
            });
          }
          if (app.creator_slug) {
            slugMap.set(app.creator_slug.toLowerCase(), {
              deal_id: app.deal_id,
              creator_id: app.creator_id,
              creator_slug: app.creator_slug,
            });
          }
        }

        // Build deal lookup for revenue_share_pct
        const dealMap = new Map<string, number>();
        for (const deal of deals) {
          dealMap.set(deal.id, deal.revenue_share_pct);
        }

        // Fetch Stripe charges since last sync
        const stripe = new Stripe(stripeReadKey, { apiVersion: "2023-10-16" });

        let hasMore = true;
        let startingAfter: string | undefined;
        let brandSynced = 0;

        while (hasMore) {
          const params: Stripe.ChargeListParams = {
            created: { gt: sinceUnix },
            limit: 100,
          };
          if (startingAfter) {
            params.starting_after = startingAfter;
          }

          let charges: Stripe.ApiList<Stripe.Charge>;
          try {
            charges = await stripe.charges.list(params);
          } catch (stripeErr: unknown) {
            const msg = stripeErr instanceof Error ? stripeErr.message : "Unknown Stripe error";
            console.error(`[${requestId}] Brand ${brand.id}: Stripe list charges error: ${msg}`);
            break;
          }

          for (const charge of charges.data) {
            if (!charge.paid || charge.refunded) continue;

            // Try to attribute this charge
            let attribution: {
              deal_id: string;
              creator_id: string;
              method: string;
              ref: string;
            } | null = null;

            // Method 1: Check if charge has a coupon/promotion code in metadata
            const chargeCoupon = (
              charge.metadata?.coupon_code ??
              charge.metadata?.promo_code ??
              charge.metadata?.discount_code ??
              ""
            ).toLowerCase();

            if (chargeCoupon && couponMap.has(chargeCoupon)) {
              const match = couponMap.get(chargeCoupon)!;
              attribution = {
                deal_id: match.deal_id,
                creator_id: match.creator_id,
                method: "coupon",
                ref: match.coupon_code,
              };
            }

            // Method 2: Check for landing page attribution ref in metadata
            if (!attribution) {
              const landingRef = (
                charge.metadata?.attribution_ref ??
                charge.metadata?.ref ??
                charge.metadata?.utm_source ??
                ""
              ).toLowerCase();

              if (landingRef && slugMap.has(landingRef)) {
                const match = slugMap.get(landingRef)!;
                attribution = {
                  deal_id: match.deal_id,
                  creator_id: match.creator_id,
                  method: "landing_page",
                  ref: match.creator_slug,
                };
              }
            }

            if (!attribution) continue;

            const revSharePct = dealMap.get(attribution.deal_id);
            if (revSharePct === undefined) continue;

            const amountCents = charge.amount;
            const commissionCents = Math.round(amountCents * revSharePct / 100);
            const platformFeeCents = Math.round(commissionCents * PLATFORM_FEE_RATE);

            // Idempotent insert: skip if stripe_charge_id already exists
            const { error: insertErr } = await db
              .from("attributed_sales")
              .upsert(
                {
                  stripe_charge_id: charge.id,
                  deal_id: attribution.deal_id,
                  creator_id: attribution.creator_id,
                  brand_id: brand.id,
                  amount_cents: amountCents,
                  currency: charge.currency,
                  attribution_method: attribution.method,
                  attribution_ref: attribution.ref,
                  commission_cents: commissionCents,
                  platform_fee_cents: platformFeeCents,
                  stripe_created_at: new Date(charge.created * 1000).toISOString(),
                  synced_at: new Date().toISOString(),
                  verified: false,
                },
                { onConflict: "stripe_charge_id", ignoreDuplicates: true },
              );

            if (insertErr) {
              console.error(
                `[${requestId}] Brand ${brand.id}: insert error for charge ${charge.id}: ${insertErr.message}`,
              );
              continue;
            }

            brandSynced++;
          }

          hasMore = charges.has_more;
          if (charges.data.length > 0) {
            startingAfter = charges.data[charges.data.length - 1].id;
          }
        }

        totalSynced += brandSynced;
        brandsProcessed++;
        console.log(`[${requestId}] Brand ${brand.id}: synced ${brandSynced} new sales`);
      } catch (brandErr: unknown) {
        const msg = brandErr instanceof Error ? brandErr.message : "Unknown error";
        console.error(`[${requestId}] Brand ${brand.id}: unhandled error: ${msg}`);
        continue;
      }
    }

    console.log(
      `[${requestId}] Sync complete: ${totalSynced} sales across ${brandsProcessed} brands`,
    );

    return jsonResponse({
      request_id: requestId,
      synced: totalSynced,
      brands_processed: brandsProcessed,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[${requestId}] Unhandled error: ${msg}`);
    return errorResponse("internal_error", "An unexpected error occurred", 500, requestId);
  }
});
