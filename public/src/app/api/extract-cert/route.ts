import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const apiKey = formData.get("apiKey") as string;
    const baseUrl = formData.get("baseUrl") as string;
    const model = formData.get("model") as string;
    const certDataStr = formData.get("certData") as string;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required. Please configure it in Settings." },
        { status: 400 }
      );
    }

    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided for extraction." },
        { status: 400 }
      );
    }

    let certData: any = {};
    try {
      certData = certDataStr ? JSON.parse(certDataStr) : {};
    } catch {
      certData = {};
    }

    // Parse file contents for context
    const fileContents: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
      const sizeKB = Math.round(file.size / 1024);

      try {
        if (fileExt === "csv" || fileExt === "tsv") {
          // Parse CSV/TSV files
          const buffer = await file.arrayBuffer();
          const wb = XLSX.read(buffer, { type: "array" });
          for (const sheetName of wb.SheetNames) {
            const ws = wb.Sheets[sheetName];
            const csvData = XLSX.utils.sheet_to_csv(ws);
            fileContents.push(`=== ${file.name} (Sheet: ${sheetName}) ===\n${csvData}`);
          }
        } else if (fileExt === "xlsx" || fileExt === "xls") {
          // Parse Excel files
          const buffer = await file.arrayBuffer();
          const wb = XLSX.read(buffer, { type: "array" });
          for (const sheetName of wb.SheetNames) {
            const ws = wb.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });
            if (jsonData.length > 0) {
              const tableStr = jsonData.map((row: any) =>
                Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(" | ")
              ).join("\n");
              fileContents.push(`=== ${file.name} (Sheet: ${sheetName}) ===\n${tableStr}`);
            }
          }
        } else if (fileExt === "pdf") {
          // PDF: read as buffer and attempt basic text extraction
          // Since we don't have a PDF parsing library, include filename and size for context
          const buffer = Buffer.from(await file.arrayBuffer());
          // Try to extract some text from PDF (basic approach - look for readable strings)
          const textChunks: string[] = [];
          const text = buffer.toString("latin1");
          // Extract readable text sequences (longer than 20 chars, mostly printable)
          const matches = text.match(/[\x20-\x7E\n\r\t]{20,}/g);
          if (matches && matches.length > 0) {
            for (const match of matches.slice(0, 200)) {
              if (match.trim().length > 10) textChunks.push(match.trim());
            }
          }
          if (textChunks.length > 0) {
            fileContents.push(`=== ${file.name} (PDF - extracted text) ===\n${textChunks.slice(0, 100).join("\n")}`);
          } else {
            fileContents.push(`=== ${file.name} (PDF - could not extract text, ${sizeKB}KB) ===`);
          }
        } else if (fileExt === "docx") {
          // DOCX: try to extract XML text
          const buffer = Buffer.from(await file.arrayBuffer());
          const text = buffer.toString("utf-8");
          const textMatches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
          if (textMatches) {
            const docText = textMatches
              .map(m => m.replace(/<w:t[^>]*>/, "").replace(/<\/w:t>/, ""))
              .join(" ");
            fileContents.push(`=== ${file.name} (Word document) ===\n${docText.substring(0, 8000)}`);
          } else {
            fileContents.push(`=== ${file.name} (Word document - ${sizeKB}KB) ===`);
          }
        } else if (fileExt === "json") {
          const buffer = await file.arrayBuffer();
          const text = new TextDecoder().decode(buffer);
          fileContents.push(`=== ${file.name} (JSON) ===\n${text.substring(0, 8000)}`);
        } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)) {
          // Images: can't extract text, but note them
          fileContents.push(`=== ${file.name} (Image file - ${sizeKB}KB) ===\n[Image file - AI vision analysis not available]`);
        } else {
          // Try reading as text
          try {
            const buffer = await file.arrayBuffer();
            const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
            fileContents.push(`=== ${file.name} (${sizeKB}KB) ===\n${text.substring(0, 8000)}`);
          } catch {
            fileContents.push(`=== ${file.name} (${file.type || "unknown"}, ${sizeKB}KB) ===\n[Binary file - could not extract text]`);
          }
        }
      } catch (parseErr) {
        fileContents.push(`=== ${file.name} (${sizeKB}KB) ===\n[Error parsing file: ${parseErr instanceof Error ? parseErr.message : "unknown"}]`);
      }
    }

    const allContent = fileContents.join("\n\n");

    const url = `${baseUrl || "https://integrate.api.nvidia.com/v1"}/chat/completions`;

    const messages = [
      {
        role: "system",
        content: `You are an AI assistant for Al Ryum Contracting & General Transport LLC in Abu Dhabi, UAE. You are an expert at extracting payment certificate data from construction documents (purchase orders, invoices, delivery notes, work inspection requests, variation orders).

Your task is to analyze the ACTUAL CONTENT of the uploaded documents and extract structured data to fill out a Vendor Payment Certificate form. You MUST respond with ONLY valid JSON (no markdown, no code fences, no extra text).

The JSON must follow this exact structure - return only the fields that have values, and return "KEEP_EXISTING" for fields that should not be overwritten:

{
  "vendorType": "Material, Consultant, Plant and/or Labour Only, or Supply and Fix Subcon",
  "vendorName": "extracted vendor name or KEEP_EXISTING",
  "vendorAddr1": "extracted address or KEEP_EXISTING",
  "vendorContact": "extracted contact phone or KEEP_EXISTING",
  "vendorMob": "extracted mobile or KEEP_EXISTING",
  "vendorFax": "extracted fax or KEEP_EXISTING",
  "licenseNo": "extracted license number or KEEP_EXISTING",
  "licenseExp": "extracted license expiry or KEEP_EXISTING",
  "trnVat": "extracted TRN/VAT number or KEEP_EXISTING",
  "scOrderNo": "extracted SC/PO order number or KEEP_EXISTING",
  "scOrderDate": "extracted order date or KEEP_EXISTING",
  "project": "extracted project name or KEEP_EXISTING",
  "projectNo": "extracted project number or KEEP_EXISTING",
  "certDate": "extracted or current date or KEEP_EXISTING",
  "certNo": "extracted certificate number or KEEP_EXISTING",
  "paymentTerms": "extracted payment terms or KEEP_EXISTING",
  "periodEnding": "extracted period ending or KEEP_EXISTING",
  "advancedPayment": "extracted advance payment amount (number only, no currency symbol) or KEEP_EXISTING",
  "advPay": ["pay_to_date", "previous_payment", "this_payment_due"] or KEEP_EXISTING,
  "progressPay": ["pay_to_date", "previous_payment", "this_payment_due"] or KEEP_EXISTING,
  "retention": ["pay_to_date", "previous_payment", "this_payment_due"] or KEEP_EXISTING,
  "advRecovery": ["pay_to_date", "previous_payment", "this_payment_due"] or KEEP_EXISTING,
  "contra": ["pay_to_date", "previous_payment", "this_payment_due"] or KEEP_EXISTING,
  "vatRate": "VAT percentage or KEEP_EXISTING",
  "appAItems": [{"desc": "...", "contractorTotal": "number", "contractorPct": "number", "contractorGross": "number", "arcTotal": "number", "arcPct": "number", "arcGross": "number", "comment": "..."}] or KEEP_EXISTING,
  "appBItems": [{"voNo": "...", "desc": "...", "contractorTotal": "number", "contractorPct": "number", "contractorGross": "number", "arcTotal": "number", "arcPct": "number", "arcGross": "number", "comment": "..."}] or KEEP_EXISTING,
  "appCItems": [{"desc": "...", "totalDeduction": "number", "pct": "number", "grossValue": "number"}] or KEEP_EXISTING,
  "appDItems": [{"itemNo": "...", "desc": "...", "unit": "...", "qty": "number", "rate": "number", "amount": "number", "pp1": "number", "pp2": "number", "wirRef": "...", "certified": "number"}] or KEEP_EXISTING,
  "appEItems": [{"itemNo": "...", "desc": "...", "lpoRef": "...", "ipa1": "...", "ipa2": "...", "ipa3": "...", "ipa4": "...", "ipa5": "...", "totalCertified": "number"}] or KEEP_EXISTING,
  "notes": "any extracted notes or KEEP_EXISTING"
}

IMPORTANT RULES:
1. Return ONLY the JSON object, no extra text or explanation
2. Use "KEEP_EXISTING" for fields you cannot determine from the documents
3. All monetary amounts should be numbers only (no AED prefix, no commas)
4. Percentages should be numbers only (no % sign)
5. Dates should be in DD-MMM-YY format (e.g., 26-Mar-26)
6. Extract as many appDItems line items as possible with descriptions, quantities, rates
7. If you find variation orders, populate appBItems
8. If you find contra charges, populate appCItems
9. Always try to extract vendor TRN/VAT number for tax compliance
10. The documents contain ACTUAL TEXT DATA below - read it carefully and extract every field you can`,
      },
      {
        role: "user",
        content: `I have uploaded ${files.length} supporting document(s) for a payment certificate. Here is the ACTUAL CONTENT extracted from the documents:\n\n${allContent}\n\nCurrent certificate data (fill in what you can extract from the documents above):\n${JSON.stringify(certData, null, 2)}\n\nPlease extract and return the updated certificate data as JSON.`,
      },
    ];

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "meta/llama-3.1-405b-instruct",
        messages,
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `NVIDIA API error (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse the AI response as JSON
    let extractedData;
    try {
      // Clean up potential markdown code fences
      let cleaned = content.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      extractedData = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({
        success: true,
        rawResponse: content,
        extractedData: null,
        warning: "AI returned data in an unexpected format. Raw response is available for manual reference.",
      });
    }

    return NextResponse.json({
      success: true,
      extractedData,
      rawResponse: content,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Extract cert error:", message);
    return NextResponse.json(
      { error: `Failed to process documents: ${message}` },
      { status: 500 }
    );
  }
}
