import {
  corsResponse,
  jsonResponse,
  errorResponse,
} from "../_shared/cors.ts";
import {
  getAuthUser,
  requireRole,
  createServiceClient,
} from "../_shared/auth.ts";
import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "https://esm.sh/pdf-lib@1.17.1";

const VALID_TEMPLATE_TYPES = [
  "simple_grant",
  "vesting",
  "advisory",
] as const;
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
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function validateInput(
  body: Record<string, unknown>,
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
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return { valid: false, error: `${field} is required` };
    }
  }

  if (typeof body.deal_id !== "string") {
    return { valid: false, error: "deal_id must be a string" };
  }
  if (typeof body.creator_id !== "string") {
    return { valid: false, error: "creator_id must be a string" };
  }
  if (!VALID_TEMPLATE_TYPES.includes(body.template_type as TemplateType)) {
    return {
      valid: false,
      error: `template_type must be one of: ${VALID_TEMPLATE_TYPES.join(", ")}`,
    };
  }
  if (typeof body.company_legal_name !== "string") {
    return { valid: false, error: "company_legal_name must be a string" };
  }
  if (typeof body.creator_legal_name !== "string") {
    return { valid: false, error: "creator_legal_name must be a string" };
  }

  const equityPct = Number(body.equity_pct);
  if (isNaN(equityPct) || equityPct < 0.01 || equityPct > 10) {
    return {
      valid: false,
      error: "equity_pct must be a number between 0.01 and 10",
    };
  }

  const revenueTargetCents = body.revenue_target_cents !== undefined
    ? Number(body.revenue_target_cents)
    : 0;
  if (isNaN(revenueTargetCents) || revenueTargetCents < 0) {
    return {
      valid: false,
      error: "revenue_target_cents must be a non-negative number",
    };
  }

  if (!VALID_SHARE_CLASSES.includes(body.share_class as ShareClass)) {
    return {
      valid: false,
      error: `share_class must be one of: ${VALID_SHARE_CLASSES.join(", ")}`,
    };
  }

  if (typeof body.effective_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.effective_date)) {
    return {
      valid: false,
      error: "effective_date must be a YYYY-MM-DD date string",
    };
  }

  const vestingMonths =
    body.vesting_months !== undefined && body.vesting_months !== null
      ? Number(body.vesting_months)
      : null;
  const cliffMonths =
    body.cliff_months !== undefined && body.cliff_months !== null
      ? Number(body.cliff_months)
      : null;

  if (body.template_type === "vesting") {
    if (vestingMonths === null || isNaN(vestingMonths) || vestingMonths < 1) {
      return {
        valid: false,
        error:
          "vesting_months is required and must be a positive integer for vesting template",
      };
    }
    if (cliffMonths !== null && (isNaN(cliffMonths) || cliffMonths < 0)) {
      return {
        valid: false,
        error: "cliff_months must be a non-negative integer if provided",
      };
    }
    if (cliffMonths !== null && vestingMonths !== null && cliffMonths > vestingMonths) {
      return {
        valid: false,
        error: "cliff_months cannot exceed vesting_months",
      };
    }
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
      conditions: typeof body.conditions === "string" ? body.conditions : null,
    },
  };
}

async function generatePdf(input: ContractInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612; // US Letter
  const pageHeight = 792;
  const margin = 60;
  const contentWidth = pageWidth - margin * 2;
  let yPos = pageHeight - margin;

  let page = doc.addPage([pageWidth, pageHeight]);

  function checkPageBreak(needed: number) {
    if (yPos - needed < margin + 40) {
      page = doc.addPage([pageWidth, pageHeight]);
      yPos = pageHeight - margin;
    }
  }

  function drawCenteredText(
    text: string,
    size: number,
    font = helveticaBold,
  ) {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (pageWidth - textWidth) / 2,
      y: yPos,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    yPos -= size + 8;
  }

  function drawText(
    text: string,
    size: number,
    font = helvetica,
    indent = 0,
  ) {
    // Simple word-wrap
    const maxWidth = contentWidth - indent;
    const words = text.split(" ");
    let line = "";
    const lines: string[] = [];

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, size) > maxWidth) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    for (const l of lines) {
      checkPageBreak(size + 4);
      page.drawText(l, {
        x: margin + indent,
        y: yPos,
        size,
        font,
        color: rgb(0, 0, 0),
      });
      yPos -= size + 4;
    }
    yPos -= 4;
  }

  function drawSectionTitle(title: string) {
    checkPageBreak(30);
    yPos -= 10;
    drawText(title, 12, helveticaBold);
    yPos -= 2;
  }

  function drawLine() {
    checkPageBreak(10);
    page.drawLine({
      start: { x: margin, y: yPos },
      end: { x: pageWidth - margin, y: yPos },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPos -= 15;
  }

  // ---- Title ----
  yPos -= 10;
  drawCenteredText("EQUITY AGREEMENT", 18);
  yPos -= 5;
  drawLine();

  // ---- Parties ----
  drawSectionTitle("1. PARTIES");
  drawText(
    `This Equity Agreement ("Agreement") is entered into by and between:`,
    10,
  );
  yPos -= 4;
  drawText(
    `Company: ${input.company_legal_name} ("Company")`,
    10,
    helvetica,
    20,
  );
  drawText(
    `Creator: ${input.creator_legal_name} ("Creator")`,
    10,
    helvetica,
    20,
  );

  // ---- Terms ----
  drawSectionTitle("2. EQUITY GRANT TERMS");
  drawText(`Equity Percentage: ${input.equity_pct}%`, 10, helvetica, 20);
  drawText(
    `Share Class: ${input.share_class.charAt(0).toUpperCase() + input.share_class.slice(1)} Stock`,
    10,
    helvetica,
    20,
  );
  drawText(`Effective Date: ${input.effective_date}`, 10, helvetica, 20);

  // ---- Revenue Target / Immediate Vesting ----
  drawSectionTitle("3. VESTING CONDITIONS");
  if (input.revenue_target_cents > 0) {
    drawText(
      `This equity grant shall vest only upon Creator generating a minimum of ${formatCents(input.revenue_target_cents)} in tracked revenue through the UpsideShare platform.`,
      10,
    );
  } else {
    drawText(
      "This equity grant is effective immediately from the effective date.",
      10,
    );
  }

  // ---- Vesting Schedule (if vesting template) ----
  if (input.template_type === "vesting" && input.vesting_months) {
    drawSectionTitle("4. VESTING SCHEDULE");
    drawText(
      `Total Vesting Period: ${input.vesting_months} months`,
      10,
      helvetica,
      20,
    );
    if (input.cliff_months !== null && input.cliff_months > 0) {
      drawText(
        `Cliff Period: ${input.cliff_months} months. No equity shall vest until the cliff period has elapsed. Upon completion of the cliff, ${((input.cliff_months / input.vesting_months) * 100).toFixed(1)}% of the total grant shall vest immediately.`,
        10,
        helvetica,
        20,
      );
    } else {
      drawText("Cliff Period: None.", 10, helvetica, 20);
    }
    drawText(
      "After the cliff (if any), the remaining equity shall vest in equal monthly installments over the balance of the vesting period.",
      10,
      helvetica,
      20,
    );
  }

  // ---- Advisory specifics ----
  if (input.template_type === "advisory") {
    const sectionNum = input.template_type === "vesting" ? "5" : "4";
    drawSectionTitle(`${sectionNum}. ADVISORY ROLE`);
    drawText(
      "Creator agrees to serve in an advisory capacity to the Company, providing strategic guidance, introductions, and promotional support as mutually agreed upon by both parties.",
      10,
    );
  }

  // ---- Conditions ----
  if (input.conditions) {
    const sectionNum =
      input.template_type === "vesting"
        ? input.template_type === "advisory"
          ? "6"
          : "5"
        : input.template_type === "advisory"
          ? "5"
          : "4";
    drawSectionTitle(`${sectionNum}. ADDITIONAL CONDITIONS`);
    drawText(input.conditions, 10);
  }

  // ---- Signature lines ----
  checkPageBreak(120);
  yPos -= 20;
  drawLine();
  yPos -= 10;

  drawText("IN WITNESS WHEREOF, the parties have executed this Agreement.", 10);
  yPos -= 20;

  // Company signature
  drawText("COMPANY:", 10, helveticaBold);
  yPos -= 25;
  page.drawLine({
    start: { x: margin, y: yPos },
    end: { x: margin + 200, y: yPos },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  yPos -= 14;
  drawText(`Name: ${input.company_legal_name}`, 9);
  drawText("Date: _______________", 9);
  yPos -= 15;

  // Creator signature
  drawText("CREATOR:", 10, helveticaBold);
  yPos -= 25;
  page.drawLine({
    start: { x: margin, y: yPos },
    end: { x: margin + 200, y: yPos },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  yPos -= 14;
  drawText(`Name: ${input.creator_legal_name}`, 9);
  drawText("Date: _______________", 9);

  // ---- Footer ----
  const footerText =
    "Generated by UpsideShare. This is a template document. Consult legal counsel before signing.";
  const footerSize = 7;
  const footerWidth = helvetica.widthOfTextAtSize(footerText, footerSize);

  // Draw footer on every page
  const pages = doc.getPages();
  for (const p of pages) {
    p.drawText(footerText, {
      x: (pageWidth - footerWidth) / 2,
      y: 25,
      size: footerSize,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  return await doc.save();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return corsResponse();

  const requestId =
    req.headers.get("x-request-id") ?? crypto.randomUUID();

  if (req.method !== "POST") {
    return errorResponse(
      "method_not_allowed",
      "Only POST is accepted",
      405,
      requestId,
    );
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse(
        "unauthorized",
        "Valid authorization token required",
        401,
        requestId,
      );
    }

    const db = createServiceClient();

    const brandProfile = await requireRole(user, "brand", db);
    if (!brandProfile) {
      return errorResponse(
        "forbidden",
        "Only brand accounts can generate contracts",
        403,
        requestId,
      );
    }

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

    const validation = validateInput(body);
    if (!validation.valid) {
      return errorResponse(
        "validation_error",
        validation.error,
        400,
        requestId,
      );
    }

    const input = validation.input;

    // Verify the deal exists and belongs to this brand
    const { data: deal, error: dealErr } = await db
      .from("deals")
      .select("id, brand_id")
      .eq("id", input.deal_id)
      .eq("brand_id", user.id)
      .single();

    if (dealErr || !deal) {
      return errorResponse(
        "not_found",
        "Deal not found or you do not own this deal",
        404,
        requestId,
      );
    }

    // Verify the creator exists
    const { data: creator, error: creatorErr } = await db
      .from("profiles")
      .select("id")
      .eq("id", input.creator_id)
      .single();

    if (creatorErr || !creator) {
      return errorResponse(
        "not_found",
        "Creator not found",
        404,
        requestId,
      );
    }

    // Generate the PDF
    const pdfBytes = await generatePdf(input);
    const pdfBase64 = btoa(
      String.fromCharCode(...pdfBytes),
    );

    const now = new Date().toISOString();
    const filename = `equity-agreement-${input.deal_id.slice(0, 8)}-${input.effective_date}.pdf`;

    // Upsert equity_contracts record (idempotent on deal_id + creator_id)
    const { data: contract, error: contractErr } = await db
      .from("equity_contracts")
      .upsert(
        {
          deal_id: input.deal_id,
          creator_id: input.creator_id,
          brand_id: user.id,
          template_type: input.template_type,
          equity_pct: input.equity_pct,
          share_class: input.share_class,
          revenue_target_cents: input.revenue_target_cents,
          vesting_months: input.vesting_months,
          cliff_months: input.cliff_months,
          effective_date: input.effective_date,
          conditions: input.conditions,
          company_legal_name: input.company_legal_name,
          creator_legal_name: input.creator_legal_name,
          status: "draft",
          pdf_generated_at: now,
          updated_at: now,
        },
        {
          onConflict: "deal_id,creator_id",
          ignoreDuplicates: false,
        },
      )
      .select("id")
      .single();

    if (contractErr) {
      console.error(
        `[${requestId}] Contract upsert error: ${contractErr.message}`,
      );
      return errorResponse(
        "db_error",
        "Failed to save contract record",
        500,
        requestId,
      );
    }

    console.log(
      `[${requestId}] Generated contract ${contract.id} for deal ${input.deal_id}`,
    );

    return jsonResponse({
      request_id: requestId,
      contractId: contract.id,
      pdfBase64,
      filename,
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
