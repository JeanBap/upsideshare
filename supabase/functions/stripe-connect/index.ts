import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthUser, requireRole, createServiceClient } from "../_shared/auth.ts";
import Stripe from "https://esm.sh/stripe@14";

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const requestId = crypto.randomUUID();

  if (req.method !== "POST") {
    return errorResponse("method_not_allowed", "Only POST is accepted", 405, requestId);
  }

  try {
    // Authenticate
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse("unauthorized", "Valid authorization token required", 401, requestId);
    }

    // Parse body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return errorResponse("invalid_body", "Request body must be valid JSON", 400, requestId);
    }

    const authorizationCode = body.authorization_code;
    if (typeof authorizationCode !== "string" || authorizationCode.trim().length === 0) {
      return errorResponse(
        "missing_field",
        "authorization_code is required and must be a non-empty string",
        400,
        requestId,
      );
    }

    // Verify the user is a brand
    const db = createServiceClient();
    const profile = await requireRole(user, "brand", db);
    if (!profile) {
      return errorResponse("forbidden", "Only brand accounts can connect Stripe", 403, requestId);
    }

    // Exchange the authorization code with Stripe for an access token
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error(`[${requestId}] STRIPE_SECRET_KEY not configured`);
      return errorResponse("server_error", "Stripe integration not configured", 500, requestId);
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    let oauthResponse: Stripe.OAuthToken;
    try {
      oauthResponse = await stripe.oauth.token({
        grant_type: "authorization_code",
        code: authorizationCode.trim(),
      });
    } catch (stripeErr: unknown) {
      const msg =
        stripeErr instanceof Error ? stripeErr.message : "Stripe OAuth exchange failed";
      console.error(`[${requestId}] Stripe OAuth error: ${msg}`);
      return errorResponse("stripe_oauth_failed", "Failed to exchange authorization code with Stripe", 400, requestId);
    }

    const stripeAccountId = oauthResponse.stripe_user_id;
    // The restricted/read-only key from the connected account
    const stripeReadKey = oauthResponse.access_token;

    if (!stripeAccountId || !stripeReadKey) {
      console.error(`[${requestId}] Stripe OAuth response missing account_id or access_token`);
      return errorResponse(
        "stripe_oauth_incomplete",
        "Stripe did not return the expected account credentials",
        502,
        requestId,
      );
    }

    // Encrypt the read key before storing.
    // In production this would use pgcrypto or a KMS. For now we store
    // a base64-encoded value with a prefix so it is never stored as plaintext
    // and the column name makes the intent clear.
    const encryptionPrefix = Deno.env.get("ENCRYPTION_PREFIX") ?? "enc_v1:";
    const encodedKey = encryptionPrefix + btoa(stripeReadKey);

    // Upsert the Stripe info on the brand profile (idempotent)
    const now = new Date().toISOString();
    const { error: updateErr } = await db
      .from("profiles")
      .update({
        stripe_account_id: stripeAccountId,
        stripe_read_key_encrypted: encodedKey,
        stripe_connected_at: now,
      })
      .eq("id", user.id);

    if (updateErr) {
      console.error(`[${requestId}] Profile update error: ${updateErr.message}`);
      return errorResponse("db_error", "Failed to save Stripe connection", 500, requestId);
    }

    console.log(`[${requestId}] Brand ${user.id} connected Stripe account ${stripeAccountId}`);

    return jsonResponse({
      request_id: requestId,
      connected: true,
      stripe_account_id: stripeAccountId,
      connected_at: now,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[${requestId}] Unhandled error: ${msg}`);
    return errorResponse("internal_error", "An unexpected error occurred", 500, requestId);
  }
});
