const ALLOWED_ORIGINS = [
  "https://upsideshare.com",
  "https://www.upsideshare.com",
  "http://localhost:3000",
];

function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0]; // default to production
}

export function getCorsHeaders(req: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(req),
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization,content-type,x-request-id,x-cron-secret,apikey",
    "Vary": "Origin",
  };
}

// Keep backward-compat export for functions that spread corsHeaders
// but prefer getCorsHeaders(req) for origin-aware responses
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "https://upsideshare.com",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization,content-type,x-request-id,x-cron-secret,apikey",
  "Vary": "Origin",
};

/**
 * Returns a 204 Response for OPTIONS preflight requests, or null if not a preflight.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }
  return null;
}

/**
 * Returns a JSON Response with CORS headers attached.
 */
export function jsonResponse(
  data: Record<string, unknown> | unknown[],
  status = 200,
  req?: Request,
): Response {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Returns a coded error JSON Response with CORS headers.
 */
export function errorResponse(
  code: string,
  message: string,
  status = 400,
  requestId?: string,
  req?: Request,
): Response {
  const body: Record<string, unknown> = { error: { code, message } };
  if (requestId) body.request_id = requestId;
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
