import {
  handleCors,
  jsonResponse,
  errorResponse,
} from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/auth.ts";

/* ------------------------------------------------------------------ */
/*  Simple in-memory rate limiter (IP-based, 10 req/min)              */
/* ------------------------------------------------------------------ */
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 10;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

// Periodically clean stale entries to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipHits) {
    if (now > entry.resetAt) ipHits.delete(ip);
  }
}, RATE_WINDOW_MS * 2);

const VALID_INTERESTS = [
  "merchandise",
  "experiences",
  "handcrafted",
  "notes",
  "chat",
  "general",
] as const;
type Interest = (typeof VALID_INTERESTS)[number];

// RFC 5322 simplified email regex
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return handleCors(req);

  const requestId =
    req.headers.get("x-request-id") ?? crypto.randomUUID();

  // Rate limit check (IP-based, 10 req/min)
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown";
  if (isRateLimited(clientIp)) {
    return errorResponse(
      "rate_limited",
      "Too many requests. Please try again in a minute.",
      429,
      requestId,
    );
  }

  if (req.method !== "POST") {
    return errorResponse(
      "method_not_allowed",
      "Only POST is accepted",
      405,
      requestId,
    );
  }

  try {
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

    // Validate email
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !EMAIL_REGEX.test(email)) {
      return errorResponse(
        "invalid_email",
        "A valid email address is required",
        400,
        requestId,
      );
    }

    if (email.length > 320) {
      return errorResponse(
        "invalid_email",
        "Email address is too long",
        400,
        requestId,
      );
    }

    // Validate interest
    const interest = body.interest as string | undefined;
    if (!interest || !VALID_INTERESTS.includes(interest as Interest)) {
      return errorResponse(
        "invalid_interest",
        `interest is required and must be one of: ${VALID_INTERESTS.join(", ")}`,
        400,
        requestId,
      );
    }

    // Optional fields
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 200) : null;
    const sourcePage =
      typeof body.source_page === "string"
        ? body.source_page.trim().slice(0, 500)
        : null;

    const db = createServiceClient();

    // Upsert on (email, interest) unique constraint -- idempotent
    const { error: upsertErr } = await db
      .from("waitlist_signups")
      .upsert(
        {
          email,
          name,
          interest,
          source_page: sourcePage,
        },
        {
          onConflict: "email,interest",
          ignoreDuplicates: true,
        },
      );

    if (upsertErr) {
      console.error(
        `[${requestId}] Waitlist upsert error: ${upsertErr.message}`,
      );
      return errorResponse(
        "db_error",
        "Failed to save waitlist signup",
        500,
        requestId,
      );
    }

    console.log(
      `[${requestId}] Waitlist signup: ${email} for ${interest}`,
    );

    return jsonResponse({
      request_id: requestId,
      success: true,
      message:
        "You're on the list. We'll email you when this stream launches.",
    });
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
