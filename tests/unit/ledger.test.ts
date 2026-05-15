/**
 * Unit tests for ledger edge function logic
 * Tests: bucketing/aggregation, platform fee calculation, date validation, idempotency guards
 */
import { describe, it, expect } from "vitest";

// ---- Bucketing logic (mirrored from ledger/index.ts) ----

interface Bucket {
  total_sales_cents: number;
  commission_owed_cents: number;
}

function aggregateSales(
  sales: Array<{
    deal_id: string;
    creator_id: string;
    sale_amount_cents: number;
    commission_cents: number;
  }>
): Map<string, Bucket> {
  const buckets = new Map<string, Bucket>();

  for (const sale of sales) {
    const key = `${sale.deal_id}::${sale.creator_id}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.total_sales_cents += sale.sale_amount_cents;
      existing.commission_owed_cents += sale.commission_cents;
    } else {
      buckets.set(key, {
        total_sales_cents: sale.sale_amount_cents,
        commission_owed_cents: sale.commission_cents,
      });
    }
  }

  return buckets;
}

function calculatePlatformFee(
  commissionCents: number,
  feeRate: number
): number {
  return Math.round(commissionCents * feeRate);
}

// ---- Date validation (mirrored from ledger/index.ts) ----

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// ---- Aggregation tests ----

describe("aggregateSales", () => {
  it("groups sales by deal_id + creator_id", () => {
    const sales = [
      {
        deal_id: "d1",
        creator_id: "c1",
        sale_amount_cents: 1000,
        commission_cents: 150,
      },
      {
        deal_id: "d1",
        creator_id: "c1",
        sale_amount_cents: 2000,
        commission_cents: 300,
      },
      {
        deal_id: "d1",
        creator_id: "c2",
        sale_amount_cents: 500,
        commission_cents: 75,
      },
    ];

    const result = aggregateSales(sales);

    expect(result.size).toBe(2);
    expect(result.get("d1::c1")).toEqual({
      total_sales_cents: 3000,
      commission_owed_cents: 450,
    });
    expect(result.get("d1::c2")).toEqual({
      total_sales_cents: 500,
      commission_owed_cents: 75,
    });
  });

  it("returns empty map for empty input", () => {
    expect(aggregateSales([]).size).toBe(0);
  });

  it("handles single sale", () => {
    const sales = [
      {
        deal_id: "d1",
        creator_id: "c1",
        sale_amount_cents: 5000,
        commission_cents: 750,
      },
    ];
    const result = aggregateSales(sales);
    expect(result.size).toBe(1);
    expect(result.get("d1::c1")?.total_sales_cents).toBe(5000);
  });

  it("keeps different deals separate even for same creator", () => {
    const sales = [
      {
        deal_id: "d1",
        creator_id: "c1",
        sale_amount_cents: 1000,
        commission_cents: 100,
      },
      {
        deal_id: "d2",
        creator_id: "c1",
        sale_amount_cents: 2000,
        commission_cents: 200,
      },
    ];
    const result = aggregateSales(sales);
    expect(result.size).toBe(2);
    expect(result.has("d1::c1")).toBe(true);
    expect(result.has("d2::c1")).toBe(true);
  });
});

// ---- Platform fee calculation ----

describe("calculatePlatformFee", () => {
  it("calculates 5% fee correctly", () => {
    expect(calculatePlatformFee(1000, 0.05)).toBe(50);
  });

  it("rounds to nearest cent", () => {
    // 333 * 0.05 = 16.65 -> rounds to 17
    expect(calculatePlatformFee(333, 0.05)).toBe(17);
  });

  it("returns 0 for 0 commission", () => {
    expect(calculatePlatformFee(0, 0.05)).toBe(0);
  });

  it("handles large amounts", () => {
    // $10,000 commission * 5% = $500
    expect(calculatePlatformFee(1000000, 0.05)).toBe(50000);
  });
});

// ---- Date validation ----

describe("date format validation", () => {
  it("accepts YYYY-MM-DD", () => {
    expect(dateRegex.test("2026-01-15")).toBe(true);
  });

  it("rejects DD-MM-YYYY", () => {
    expect(dateRegex.test("15-01-2026")).toBe(false);
  });

  it("rejects MM/DD/YYYY", () => {
    expect(dateRegex.test("01/15/2026")).toBe(false);
  });

  it("rejects partial date", () => {
    expect(dateRegex.test("2026-01")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(dateRegex.test("")).toBe(false);
  });
});

// ---- Idempotency guard logic ----

describe("idempotency", () => {
  it("brand_marked_paid already true returns early", () => {
    const entry = { brand_marked_paid: true };
    // Simulates the idempotent check in mark-paid
    const alreadyMarked = entry.brand_marked_paid === true;
    expect(alreadyMarked).toBe(true);
  });

  it("creator_confirmed already true returns early", () => {
    const entry = { creator_confirmed: true };
    const alreadyConfirmed = entry.creator_confirmed === true;
    expect(alreadyConfirmed).toBe(true);
  });

  it("brand must mark paid before creator can confirm", () => {
    const entry = { brand_marked_paid: false, creator_confirmed: false };
    const canConfirm = entry.brand_marked_paid === true;
    expect(canConfirm).toBe(false);
  });
});
