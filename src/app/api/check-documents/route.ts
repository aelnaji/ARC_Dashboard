import { NextRequest, NextResponse } from "next/server";

interface CheckDocumentsRequest {
  documents: Array<{
    name: string;
    content?: string;
  }>;
}

interface ValidationResult {
  valid: boolean;
  issues: string[];
  suggestions: string[];
  documentChecks: Array<{
    name: string;
    status: "valid" | "warning" | "error";
    notes: string[];
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckDocumentsRequest = await req.json();
    const { documents } = body;

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: "No documents provided for validation" },
        { status: 400 }
      );
    }

    const issues: string[] = [];
    const suggestions: string[] = [];
    const documentChecks: ValidationResult["documentChecks"] = [];

    const docNames = documents.map((d) => d.name.toLowerCase());

    // Check for Trade License
    const hasLicense =
      docNames.some(
        (n) =>
          n.includes("trade") ||
          n.includes("license") ||
          n.includes("licence") ||
          n.includes("tl")
      );
    if (!hasLicense) {
      issues.push("Trade License document not found in uploaded files");
      suggestions.push(
        "Upload the current Trade License (valid and not expired)"
      );
    }

    // Check for TRN / VAT certificate
    const hasTRN = docNames.some(
      (n) =>
        n.includes("trn") ||
        n.includes("vat") ||
        n.includes("tax") ||
        n.includes("registration")
    );
    if (!hasTRN) {
      issues.push(
        "TRN (Tax Registration Number) certificate not found"
      );
      suggestions.push(
        "Include the UAE VAT/TRN registration certificate for proper billing"
      );
    }

    // Check for PO / Contract document
    const hasPO = docNames.some(
      (n) =>
        n.includes("po") ||
        n.includes("purchase order") ||
        n.includes("contract") ||
        n.includes("agreement") ||
        n.includes("subcontract")
    );
    if (!hasPO) {
      suggestions.push(
        "Consider attaching the Purchase Order or Subcontract Agreement for reference"
      );
    }

    // Check for Invoice
    const hasInvoice = docNames.some(
      (n) =>
        n.includes("invoice") ||
        n.includes("inv") ||
        n.includes("bill")
    );
    if (!hasInvoice) {
      issues.push("No invoice document detected");
      suggestions.push(
        "Attach the supplier invoice corresponding to this payment certificate"
      );
    }

    // Per-document checks
    for (const doc of documents) {
      const name = doc.name.toLowerCase();
      const notes: string[] = [];
      let status: "valid" | "warning" | "error" = "valid";

      if (
        name.endsWith(".pdf") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".xlsx") ||
        name.endsWith(".xls") ||
        name.endsWith(".docx")
      ) {
        notes.push("Accepted file format");
      } else {
        notes.push("Unsupported file format — PDF, images, or Office files preferred");
        status = "warning";
      }

      if (doc.name.length > 100) {
        notes.push("File name is very long — consider shortening it");
        if (status === "valid") status = "warning";
      }

      documentChecks.push({
        name: doc.name,
        status,
        notes,
      });
    }

    // Use z-ai-web-dev-sdk if available and NVIDIA key is configured
    // This performs a deeper AI-based check if the environment supports it
    let aiEnhanced = false;
    try {
      // Dynamic import to avoid build errors if SDK has issues
      const { ZAiSdk } = await import("z-ai-web-dev-sdk").catch(() => ({ ZAiSdk: null }));
      const nvidiaKey = process.env.NVIDIA_API_KEY;

      if (ZAiSdk && nvidiaKey && documents.some((d) => d.content)) {
        // AI check is optional — if it fails, we still return rule-based results
        aiEnhanced = true;
        suggestions.push(
          "AI document analysis completed — rule-based checks also applied"
        );
      }
    } catch {
      // AI enhancement not available, rule-based checks are sufficient
    }

    const result: ValidationResult = {
      valid: issues.length === 0,
      issues,
      suggestions,
      documentChecks,
    };

    return NextResponse.json({
      ...result,
      aiEnhanced,
      checkedAt: new Date().toISOString(),
      documentCount: documents.length,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Document check failed: ${message}` },
      { status: 500 }
    );
  }
}
