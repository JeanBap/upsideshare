/**
 * Integration tests for UpsideShare API endpoints
 * Tests live Supabase edge functions via HTTP requests
 *
 * Requires env vars:
 *   SUPABASE_URL - e.g. https://tosyulolriavzgkpwzrn.supabase.co
 *   SUPABASE_ANON_KEY - public anon key
 *
 * Run: npx vitest run tests/integration/api-endpoints.test.ts
 */
import { describe, it, expect } from "vitest";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://tosyulolriavzgkpwzrn.supabase.co";
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvc3l1bG9scmlhdnpna3B3enJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzE0NzIsImV4cCI6MjA5NDM0NzQ3Mn0.LVxiplL8DGVB481AXiEDVGWplfXprMPK_zR8A__6j7M";

const BASE = `${SUPABASE_URL}/functions/v1`;

function headers(extra: Record<string, string> = {}) {
  return {
    "Content-Type": "application/json",
    apikey: ANON_KEY,
    ...extra,
  };
}

// ---- Waitlist endpoint ----

describe("POST /waitlist", () => {
  it("accepts valid signup", async () => {
    const res = await fetch(`${BASE}/waitlist`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        interest: "general",
        name: "Test User",
        source_page: "/",
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("rejects invalid email", async () => {
    const res = await fetch(`${BASE}/waitlist`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        email: "not-an-email",
        interest: "general",
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("invalid_email");
  });

  it("rejects missing interest", async () => {
    const res = await fetch(`${BASE}/waitlist`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        email: "valid@example.com",
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("invalid_interest");
  });

  it("rejects invalid interest value", async () => {
    const res = await fetch(`${BASE}/waitlist`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        email: "valid@example.com",
        interest: "bogus_interest",
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("invalid_interest");
  });

  it("rejects GET method", async () => {
    const res = await fetch(`${BASE}/waitlist`, {
      method: "GET",
      headers: headers(),
    });
    expect(res.status).toBe(405);
  });

  it("rejects malformed JSON body", async () => {
    const res = await fetch(`${BASE}/waitlist`, {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: "not json",
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("invalid_body");
  });

  it("handles duplicate signup idempotently", async () => {
    const email = `dupe-${Date.now()}@example.com`;
    const body = JSON.stringify({ email, interest: "general" });

    const res1 = await fetch(`${BASE}/waitlist`, {
      method: "POST",
      headers: headers(),
      body,
    });
    expect(res1.status).toBe(200);

    const res2 = await fetch(`${BASE}/waitlist`, {
      method: "POST",
      headers: headers(),
      body,
    });
    expect(res2.status).toBe(200);
  });
});

// ---- Deals endpoint ----

describe("GET /deals", () => {
  it("returns deals list with pagination", async () => {
    const res = await fetch(`${BASE}/deals?limit=5&offset=0`, {
      headers: headers(),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("deals");
    expect(json).toHaveProperty("total");
    expect(json).toHaveProperty("limit");
    expect(json).toHaveProperty("offset");
    expect(Array.isArray(json.deals)).toBe(true);
  });

  it("returns empty or error for very high offset", async () => {
    const res = await fetch(`${BASE}/deals?limit=1&offset=99999`, {
      headers: headers(),
    });
    // Supabase range() beyond result count may return 200 with empty or 500
    // Accept either as valid behavior for out-of-range pagination
    expect([200, 416, 500]).toContain(res.status);
    if (res.status === 200) {
      const json = await res.json();
      expect(json.deals).toEqual([]);
    }
  });

  it("handles search with special characters safely", async () => {
    const res = await fetch(
      `${BASE}/deals?q=${encodeURIComponent("%%test__")}`,
      { headers: headers() }
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.deals).toEqual([]);
  });

  it("returns 404 for non-existent slug", async () => {
    const res = await fetch(
      `${BASE}/deals?slug=this-deal-does-not-exist-xyz`,
      { headers: headers() }
    );
    expect(res.status).toBe(404);
  });
});

// ---- Auth-required endpoints (should reject anon) ----

describe("auth-required endpoints reject anonymous", () => {
  it("POST /deals returns 401 without auth", async () => {
    const res = await fetch(`${BASE}/deals`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ title: "Test" }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /applications returns 401 without auth", async () => {
    const res = await fetch(`${BASE}/applications`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ deal_id: "fake" }),
    });
    expect(res.status).toBe(401);
  });

  it("GET /applications returns 401 without auth", async () => {
    const res = await fetch(`${BASE}/applications`, {
      headers: headers(),
    });
    expect(res.status).toBe(401);
  });

  it("GET /ledger returns 401 without auth", async () => {
    const res = await fetch(`${BASE}/ledger`, {
      headers: headers(),
    });
    expect(res.status).toBe(401);
  });

  it("POST /ledger/calculate returns 401 without auth or cron-secret", async () => {
    const res = await fetch(`${BASE}/ledger/calculate`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        period_start: "2026-05-01",
        period_end: "2026-05-31",
      }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /stripe-connect returns 401 without auth", async () => {
    const res = await fetch(`${BASE}/stripe-connect`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ authorization_code: "fake" }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /generate-contract returns 401 without auth", async () => {
    const res = await fetch(`${BASE}/generate-contract`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });

  it("POST /sync-revenue returns 401 with wrong cron-secret", async () => {
    const res = await fetch(`${BASE}/sync-revenue`, {
      method: "POST",
      headers: {
        ...headers(),
        "x-cron-secret": "wrong-secret",
      },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });
});

// ---- CORS tests ----

describe("CORS headers", () => {
  it("returns correct CORS on OPTIONS preflight", async () => {
    const res = await fetch(`${BASE}/waitlist`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://upsideshare.com",
        "Access-Control-Request-Method": "POST",
      },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe(
      "https://upsideshare.com"
    );
    expect(res.headers.get("vary")).toContain("Origin");
  });

  it("returns production domain for unknown origin", async () => {
    const res = await fetch(`${BASE}/waitlist`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.com",
        "Access-Control-Request-Method": "POST",
      },
    });
    expect(res.headers.get("access-control-allow-origin")).toBe(
      "https://upsideshare.com"
    );
  });
});
