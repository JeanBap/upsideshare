export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization,content-type,x-request-id,x-cron-secret,apikey",
};

/**
 * Returns a 204 Response for OPTIONS preflight requests, or null if not a preflight.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return null;
}

/**
 * Returns a JSON Response with CORS headers attached.
 */
export function jsonResponse(
  data: Record<string, unknown> | unknown[],
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
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
): Response {
  const body: Record<string, unknown> = { error: { code, message } };
  if (requestId) body.request_id = requestId;
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
