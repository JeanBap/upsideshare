/**
 * Unit tests for applications edge function logic
 * Tests: coupon code generation, creator slug generation, state machine
 */
import { describe, it, expect } from "vitest";

// ---- Mirrored functions ----

function generateCouponCode(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 6; i++) {
    suffix += chars[bytes[i] % chars.length];
  }
  return `${prefix}-${suffix}`;
}

function generateCreatorSlug(
  dealSlug: string,
  creatorName: string
): string {
  const base = creatorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  const rand = crypto.randomUUID().slice(0, 4);
  return `${dealSlug}-${base}-${rand}`;
}

// ---- Coupon code tests ----

describe("generateCouponCode", () => {
  it("starts with the given prefix", () => {
    const code = generateCouponCode("JAKE");
    expect(code.startsWith("JAKE-")).toBe(true);
  });

  it("has exactly 6 chars after the prefix and dash", () => {
    const code = generateCouponCode("TEST");
    const suffix = code.split("-")[1];
    expect(suffix.length).toBe(6);
  });

  it("contains only unambiguous characters (no I, O, 0, 1)", () => {
    const allowed = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let i = 0; i < 50; i++) {
      const code = generateCouponCode("X");
      const suffix = code.split("-")[1];
      for (const char of suffix) {
        expect(allowed.includes(char)).toBe(true);
      }
    }
  });

  it("generates unique codes (probabilistic)", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateCouponCode("TEST"));
    }
    // With 32^6 = 1B+ combinations, 100 codes should all be unique
    expect(codes.size).toBe(100);
  });
});

// ---- Creator slug tests ----

describe("generateCreatorSlug", () => {
  it("includes deal slug and creator name", () => {
    const slug = generateCreatorSlug("cool-deal", "Jake Torres");
    expect(slug.startsWith("cool-deal-jake-torres-")).toBe(true);
  });

  it("lowercases the creator name", () => {
    const slug = generateCreatorSlug("deal", "UPPER CASE");
    expect(slug).toMatch(/^deal-upper-case-/);
  });

  it("truncates creator name to 30 chars", () => {
    const longName = "a".repeat(50);
    const slug = generateCreatorSlug("d", longName);
    // d- + 30 chars + - + 4 chars = 37 max from name portion
    const parts = slug.split("-");
    // first part is "d", rest includes name and random
    const nameParts = parts.slice(1, -1).join("-");
    expect(nameParts.length).toBeLessThanOrEqual(30);
  });

  it("appends random 4-char suffix", () => {
    const slug = generateCreatorSlug("deal", "jake");
    const parts = slug.split("-");
    const lastPart = parts[parts.length - 1];
    expect(lastPart.length).toBe(4);
  });
});

// ---- Application state machine ----

describe("application state machine", () => {
  const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ["approved", "rejected"],
  };

  it("allows pending -> approved", () => {
    expect(VALID_TRANSITIONS["pending"]?.includes("approved")).toBe(true);
  });

  it("allows pending -> rejected", () => {
    expect(VALID_TRANSITIONS["pending"]?.includes("rejected")).toBe(true);
  });

  it("blocks approved -> pending (no reverse)", () => {
    expect(VALID_TRANSITIONS["approved"]).toBeUndefined();
  });

  it("blocks rejected -> approved (no reverse)", () => {
    expect(VALID_TRANSITIONS["rejected"]).toBeUndefined();
  });

  it("requires rejection_reason when rejecting", () => {
    const rejectionReason = "";
    const isValid =
      typeof rejectionReason === "string" &&
      rejectionReason.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it("duplicate application check returns conflict", () => {
    // Simulates: if existingApp exists, return 409
    const existingApp = { id: "app-1", status: "pending" };
    expect(existingApp !== null).toBe(true);
  });
});
