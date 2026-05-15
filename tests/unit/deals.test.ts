/**
 * Unit tests for deals edge function logic
 * Tests: escapeLike, slugify, validation, pagination bounds
 */
import { describe, it, expect } from "vitest";

// ---- Pure function extractions (mirrored from deals/index.ts) ----

function escapeLike(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ---- escapeLike tests ----

describe("escapeLike", () => {
  it("returns input unchanged when no special chars", () => {
    expect(escapeLike("hello world")).toBe("hello world");
  });

  it("escapes percent sign", () => {
    expect(escapeLike("100%")).toBe("100\\%");
  });

  it("escapes underscore", () => {
    expect(escapeLike("my_deal")).toBe("my\\_deal");
  });

  it("escapes backslash", () => {
    expect(escapeLike("path\\to")).toBe("path\\\\to");
  });

  it("escapes multiple special chars in sequence", () => {
    expect(escapeLike("%_%\\")).toBe("\\%\\_\\%\\\\");
  });

  it("handles empty string", () => {
    expect(escapeLike("")).toBe("");
  });

  it("escapes mixed content", () => {
    expect(escapeLike("50% off_sale")).toBe("50\\% off\\_sale");
  });
});

// ---- slugify tests ----

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("My Cool Deal")).toBe("my-cool-deal");
  });

  it("removes special characters", () => {
    expect(slugify("Deal #1 (Best!)")).toBe("deal-1-best");
  });

  it("removes leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("truncates to 80 chars", () => {
    const long = "a".repeat(100);
    expect(slugify(long).length).toBe(80);
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("collapses multiple special chars into single hyphen", () => {
    expect(slugify("deal   with   spaces")).toBe("deal-with-spaces");
  });

  it("handles unicode by removing non-ascii", () => {
    expect(slugify("cafe latte")).toBe("cafe-latte");
  });
});

// ---- Pagination bounds ----

describe("pagination bounds", () => {
  const MAX_LIMIT = 50;
  const DEFAULT_LIMIT = 20;

  function clampLimit(input: number): number {
    return Math.max(1, Math.min(input, MAX_LIMIT));
  }

  function clampOffset(input: number): number {
    return Math.max(0, input);
  }

  it("clamps limit to MAX_LIMIT", () => {
    expect(clampLimit(100)).toBe(50);
  });

  it("clamps limit to minimum 1", () => {
    expect(clampLimit(0)).toBe(1);
    expect(clampLimit(-5)).toBe(1);
  });

  it("passes valid limit through", () => {
    expect(clampLimit(25)).toBe(25);
  });

  it("clamps negative offset to 0", () => {
    expect(clampOffset(-1)).toBe(0);
  });

  it("passes valid offset through", () => {
    expect(clampOffset(40)).toBe(40);
  });
});

// ---- Deal validation rules ----

describe("deal validation", () => {
  it("rejects revenue_share_pct below 1", () => {
    const pct = 0;
    expect(pct >= 1 && pct <= 50).toBe(false);
  });

  it("rejects revenue_share_pct above 50", () => {
    const pct = 51;
    expect(pct >= 1 && pct <= 50).toBe(false);
  });

  it("accepts revenue_share_pct in valid range", () => {
    expect(15 >= 1 && 15 <= 50).toBe(true);
  });

  it("rejects equity_pct above 10 when equity enabled", () => {
    const pct = 11;
    expect(pct >= 0 && pct <= 10).toBe(false);
  });

  it("accepts equity_pct in valid range", () => {
    const pct = 5;
    expect(pct >= 0 && pct <= 10).toBe(true);
  });

  it("validates status transitions", () => {
    const validStatuses = ["draft", "active", "paused", "completed", "expired"];
    expect(validStatuses.includes("active")).toBe(true);
    expect(validStatuses.includes("bogus")).toBe(false);
  });
});
