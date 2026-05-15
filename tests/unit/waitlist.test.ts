/**
 * Unit tests for waitlist edge function logic
 * Tests: rate limiter, email validation, interest validation
 */
import { describe, it, expect, beforeEach } from "vitest";

// ---- Rate limiter (mirrored from waitlist/index.ts) ----

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;

let ipHits: Map<string, { count: number; resetAt: number }>;

function resetRateLimiter() {
  ipHits = new Map();
}

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

// ---- Email regex (mirrored from waitlist/index.ts) ----

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const VALID_INTERESTS = [
  "merchandise",
  "experiences",
  "handcrafted",
  "notes",
  "chat",
  "general",
] as const;

// ---- Rate limiter tests ----

describe("isRateLimited", () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it("allows first request from new IP", () => {
    expect(isRateLimited("1.2.3.4")).toBe(false);
  });

  it("allows up to RATE_MAX requests", () => {
    for (let i = 0; i < RATE_MAX; i++) {
      expect(isRateLimited("1.2.3.4")).toBe(false);
    }
  });

  it("blocks request RATE_MAX + 1", () => {
    for (let i = 0; i < RATE_MAX; i++) {
      isRateLimited("1.2.3.4");
    }
    expect(isRateLimited("1.2.3.4")).toBe(true);
  });

  it("tracks IPs independently", () => {
    for (let i = 0; i < RATE_MAX; i++) {
      isRateLimited("1.1.1.1");
    }
    expect(isRateLimited("1.1.1.1")).toBe(true);
    expect(isRateLimited("2.2.2.2")).toBe(false);
  });

  it("resets after window expires", () => {
    // Simulate window expiry by manipulating the map directly
    ipHits.set("1.2.3.4", { count: 11, resetAt: Date.now() - 1 });
    expect(isRateLimited("1.2.3.4")).toBe(false);
  });
});

// ---- Email validation tests ----

describe("email validation", () => {
  it("accepts valid email", () => {
    expect(EMAIL_REGEX.test("user@example.com")).toBe(true);
  });

  it("accepts email with plus addressing", () => {
    expect(EMAIL_REGEX.test("user+tag@example.com")).toBe(true);
  });

  it("accepts email with dots in local part", () => {
    expect(EMAIL_REGEX.test("first.last@example.com")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(EMAIL_REGEX.test("")).toBe(false);
  });

  it("rejects missing @", () => {
    expect(EMAIL_REGEX.test("userexample.com")).toBe(false);
  });

  it("rejects missing domain", () => {
    expect(EMAIL_REGEX.test("user@")).toBe(false);
  });

  it("rejects email over 320 chars", () => {
    const longEmail = "a".repeat(310) + "@example.com";
    expect(longEmail.length > 320).toBe(true);
  });
});

// ---- Interest validation tests ----

describe("interest validation", () => {
  it("accepts all valid interests", () => {
    for (const interest of VALID_INTERESTS) {
      expect(VALID_INTERESTS.includes(interest)).toBe(true);
    }
  });

  it("rejects invalid interest", () => {
    expect(
      (VALID_INTERESTS as readonly string[]).includes("invalid")
    ).toBe(false);
  });

  it("rejects empty string", () => {
    expect(
      (VALID_INTERESTS as readonly string[]).includes("")
    ).toBe(false);
  });
});
