/**
 * Unit tests for generate-contract edge function logic
 * Tests: validateInput, formatCents
 */
import { describe, it, expect } from "vitest";

// ---- Mirrored types and functions ----

const VALID_TEMPLATE_TYPES = ["simple_grant", "vesting", "advisory"] as const;
type TemplateType = (typeof VALID_TEMPLATE_TYPES)[number];

const VALID_SHARE_CLASSES = ["common", "preferred"] as const;
type ShareClass = (typeof VALID_SHARE_CLASSES)[number];

interface ContractInput {
  deal_id: string;
  creator_id: string;
  template_type: TemplateType;
  company_legal_name: string;
  creator_legal_name: string;
  equity_pct: number;
  revenue_target_cents: number;
  share_class: ShareClass;
  vesting_months: number | null;
  cliff_months: number | null;
  effective_date: string;
  conditions: string | null;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function validateInput(
  body: Record<string, unknown>
): { valid: true; input: ContractInput } | { valid: false; error: string } {
  const required = [
    "deal_id",
    "creator_id",
    "template_type",
    "company_legal_name",
    "creator_legal_name",
    "equity_pct",
    "share_class",
    "effective_date",
  ];

  for (const field of required) {
    if (
      body[field] === undefined ||
      body[field] === null ||
      body[field] === ""
    ) {
      return { valid: false, error: `${field} is required` };
    }
  }

  if (typeof body.deal_id !== "string")
    return { valid: false, error: "deal_id must be a string" };
  if (typeof body.creator_id !== "string")
    return { valid: false, error: "creator_id must be a string" };
  if (!VALID_TEMPLATE_TYPES.includes(body.template_type as TemplateType))
    return {
      valid: false,
      error: `template_type must be one of: ${VALID_TEMPLATE_TYPES.join(", ")}`,
    };
  if (typeof body.company_legal_name !== "string")
    return { valid: false, error: "company_legal_name must be a string" };
  if (typeof body.creator_legal_name !== "string")
    return { valid: false, error: "creator_legal_name must be a string" };

  const equityPct = Number(body.equity_pct);
  if (isNaN(equityPct) || equityPct < 0.01 || equityPct > 10)
    return {
      valid: false,
      error: "equity_pct must be a number between 0.01 and 10",
    };

  const revenueTargetCents =
    body.revenue_target_cents !== undefined
      ? Number(body.revenue_target_cents)
      : 0;
  if (isNaN(revenueTargetCents) || revenueTargetCents < 0)
    return {
      valid: false,
      error: "revenue_target_cents must be a non-negative number",
    };

  if (!VALID_SHARE_CLASSES.includes(body.share_class as ShareClass))
    return {
      valid: false,
      error: `share_class must be one of: ${VALID_SHARE_CLASSES.join(", ")}`,
    };

  if (
    typeof body.effective_date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.effective_date)
  )
    return {
      valid: false,
      error: "effective_date must be a YYYY-MM-DD date string",
    };

  const vestingMonths =
    body.vesting_months !== undefined && body.vesting_months !== null
      ? Number(body.vesting_months)
      : null;
  const cliffMonths =
    body.cliff_months !== undefined && body.cliff_months !== null
      ? Number(body.cliff_months)
      : null;

  if (body.template_type === "vesting") {
    if (vestingMonths === null || isNaN(vestingMonths) || vestingMonths < 1)
      return {
        valid: false,
        error:
          "vesting_months is required and must be a positive integer for vesting template",
      };
    if (cliffMonths !== null && (isNaN(cliffMonths) || cliffMonths < 0))
      return {
        valid: false,
        error: "cliff_months must be a non-negative integer if provided",
      };
    if (
      cliffMonths !== null &&
      vestingMonths !== null &&
      cliffMonths > vestingMonths
    )
      return {
        valid: false,
        error: "cliff_months cannot exceed vesting_months",
      };
  }

  return {
    valid: true,
    input: {
      deal_id: body.deal_id as string,
      creator_id: body.creator_id as string,
      template_type: body.template_type as TemplateType,
      company_legal_name: body.company_legal_name as string,
      creator_legal_name: body.creator_legal_name as string,
      equity_pct: equityPct,
      revenue_target_cents: revenueTargetCents,
      share_class: body.share_class as ShareClass,
      vesting_months: vestingMonths,
      cliff_months: cliffMonths,
      effective_date: body.effective_date as string,
      conditions:
        typeof body.conditions === "string" ? body.conditions : null,
    },
  };
}

// ---- Valid base input for reuse ----

const VALID_BASE = {
  deal_id: "abc-123",
  creator_id: "def-456",
  template_type: "simple_grant",
  company_legal_name: "Acme Corp",
  creator_legal_name: "Jake Torres",
  equity_pct: 2.5,
  share_class: "common",
  effective_date: "2026-06-01",
};

// ---- formatCents tests ----

describe("formatCents", () => {
  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00");
  });

  it("formats whole dollars", () => {
    expect(formatCents(10000)).toBe("$100.00");
  });

  it("formats cents", () => {
    expect(formatCents(1999)).toBe("$19.99");
  });

  it("formats large amounts with commas", () => {
    expect(formatCents(1000000)).toBe("$10,000.00");
  });
});

// ---- validateInput tests ----

describe("validateInput", () => {
  it("accepts valid simple_grant input", () => {
    const result = validateInput(VALID_BASE);
    expect(result.valid).toBe(true);
  });

  it("rejects missing deal_id", () => {
    const { deal_id, ...rest } = VALID_BASE;
    const result = validateInput(rest);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("deal_id");
  });

  it("rejects missing creator_id", () => {
    const result = validateInput({ ...VALID_BASE, creator_id: "" });
    expect(result.valid).toBe(false);
  });

  it("rejects invalid template_type", () => {
    const result = validateInput({ ...VALID_BASE, template_type: "bogus" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("template_type");
  });

  it("rejects equity_pct below 0.01", () => {
    const result = validateInput({ ...VALID_BASE, equity_pct: 0 });
    expect(result.valid).toBe(false);
  });

  it("rejects equity_pct above 10", () => {
    const result = validateInput({ ...VALID_BASE, equity_pct: 11 });
    expect(result.valid).toBe(false);
  });

  it("accepts equity_pct at boundaries", () => {
    expect(validateInput({ ...VALID_BASE, equity_pct: 0.01 }).valid).toBe(true);
    expect(validateInput({ ...VALID_BASE, equity_pct: 10 }).valid).toBe(true);
  });

  it("rejects negative revenue_target_cents", () => {
    const result = validateInput({
      ...VALID_BASE,
      revenue_target_cents: -100,
    });
    expect(result.valid).toBe(false);
  });

  it("accepts zero revenue_target_cents (from $0)", () => {
    const result = validateInput({
      ...VALID_BASE,
      revenue_target_cents: 0,
    });
    expect(result.valid).toBe(true);
  });

  it("defaults revenue_target_cents to 0 when undefined", () => {
    const result = validateInput(VALID_BASE);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.input.revenue_target_cents).toBe(0);
    }
  });

  it("rejects invalid share_class", () => {
    const result = validateInput({ ...VALID_BASE, share_class: "super" });
    expect(result.valid).toBe(false);
  });

  it("rejects invalid effective_date format", () => {
    const result = validateInput({
      ...VALID_BASE,
      effective_date: "06-01-2026",
    });
    expect(result.valid).toBe(false);
  });

  it("requires vesting_months for vesting template", () => {
    const result = validateInput({
      ...VALID_BASE,
      template_type: "vesting",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("vesting_months");
  });

  it("accepts vesting template with valid months", () => {
    const result = validateInput({
      ...VALID_BASE,
      template_type: "vesting",
      vesting_months: 48,
      cliff_months: 12,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects cliff_months > vesting_months", () => {
    const result = validateInput({
      ...VALID_BASE,
      template_type: "vesting",
      vesting_months: 12,
      cliff_months: 24,
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("cliff_months");
  });

  it("accepts advisory template without vesting", () => {
    const result = validateInput({
      ...VALID_BASE,
      template_type: "advisory",
    });
    expect(result.valid).toBe(true);
  });
});
