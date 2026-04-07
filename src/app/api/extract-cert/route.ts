import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Export maxDuration to allow up to 5 minutes for processing large documents
export const maxDuration = 300;

// ── Helper: call NVIDIA API directly ──
async function callNvidia(apiKey: string, baseUrl: string, model: string, messages: any[], maxTokens = 4096) {
  const url = `${baseUrl || "https://integrate.api.nvidia.com/v1"}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.1, max_tokens: maxTokens }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errorText.substring(0, 500)}`);
  }
  return response.json();
}

// ── OCR prompt shared for PDFs and images ──
const OCR_PROMPT = `You are a precise OCR extraction engine for construction payment certificates. Extract ALL text visible in this image including:

- Company/vendor names, addresses, phone numbers, fax, mobile
- License numbers, TRN/VAT/tax registration numbers (often 15 digits)
- Purchase orders (PO), sub-contract order numbers (SC/PO/LPO), dates
- Project names (e.g. MBZ Package 05), project numbers (e.g. RCTP0417)
- ALL monetary amounts (AED values), payment figures
- Line items: item numbers, descriptions, units, quantities, unit rates, amounts
- Progress % (PP1, PP2), completion percentages
- Invoice numbers, delivery notes, WIR/MIR references
- Certificate numbers, dates, period ending (e.g. November-24)
- Signatories, preparers, approvers and their roles
- Any tables, schedules, or structured data (extract as accurately as possible)
- Payment Schedule rows: Advance Payment, Progress Payment, Gross Total, Retention, Advance Recovery, Contra, Net Total, VAT, Total Due
- Appendix A: Description, Contractor Total, %, Gross, ARC Total, ARC %, ARC Gross
- Appendix B: VO numbers, descriptions, amounts
- Appendix C: Deductions and contra charges
- Appendix D: BOQ line items with item no, description, unit, qty, rate, amount, PP1%, PP2%, WIR ref, certified amount
- Appendix E: IPA payment history per work package with IPA month labels

Return the extracted text in a clear, structured format. For tables, use a markdown-like table structure. Ensure TRNs and order numbers are extracted with all digits.`;

// ── Helper: Process ALL PDFs via vision model (page by page) ──
async function processPDFViaVision(
  buffer: Buffer,
  fileName: string,
  apiKey: string,
  baseUrl: string,
  visionModel: string,
  processLog: string[],
  maxPages = 20
): Promise<string> {
  let ocrText = "";

  try {
    const { pdf } = await import("pdf-to-img");
    const pages = await pdf(buffer, { scale: 1.6 });

    let pageNum = 0;
    for await (const imageBuffer of pages) {
      pageNum++;
      if (pageNum > maxPages) {
        processLog.push(`⏹️ ${fileName}: Reached max pages limit (${maxPages})`);
        break;
      }

      try {
        processLog.push(`🔄 OCR: Page ${pageNum} of ${fileName}...`);

        const base64Data = `data:image/png;base64,${imageBuffer.toString("base64")}`;

        if (pageNum > 1) await new Promise(resolve => setTimeout(resolve, 200));

        const visionResponse = await callNvidia(apiKey, baseUrl, visionModel, [
          {
            role: "user",
            content: [
              { type: "text", text: OCR_PROMPT },
              { type: "image_url", image_url: { url: base64Data } },
            ],
          },
        ], 4096);

        const imgOcrText = visionResponse.choices?.[0]?.message?.content || "";

        if (imgOcrText) {
          ocrText += `\n\n=== OCR: ${fileName} — Page ${pageNum} ===\n${imgOcrText}`;
          processLog.push(`✅ Page ${pageNum}: OCR extracted ${imgOcrText.length} chars`);
        } else {
          processLog.push(`⚠️ Page ${pageNum}: OCR returned empty`);
        }
      } catch (pageErr: any) {
        processLog.push(`❌ Page ${pageNum}: OCR failed — ${pageErr.message || "unknown"}`);
      }
    }

    return ocrText;
  } catch (err) {
    console.error("PDF to image conversion error:", err);
    throw err;
  }
}

// ── Helper: convert Buffer to base64 data URI ──
function toBase64DataURI(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

// ── Helper: get MIME type from extension ──
function getMimeType(ext: string): string {
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", bmp: "image/bmp",
  };
  return mimeMap[ext] || "application/octet-stream";
}

// ── Helper: Process single image with OCR ──
async function processImageOCR(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  apiKey: string,
  baseUrl: string,
  visionModel: string
): Promise<string> {
  const dataUri = toBase64DataURI(buffer, mimeType);

  const visionResponse = await callNvidia(apiKey, baseUrl, visionModel, [
    {
      role: "user",
      content: [
        { type: "text", text: OCR_PROMPT },
        { type: "image_url", image_url: { url: dataUri } },
      ],
    },
  ], 4096);

  return visionResponse.choices?.[0]?.message?.content || "";
}

export async function POST(request: NextRequest) {
  const processLog: string[] = [];

  try {
    const formData = await request.formData();

    const apiKey = formData.get("apiKey") as string;
    const baseUrl = formData.get("baseUrl") as string;
    const model = formData.get("model") as string;
    const visionModel = formData.get("visionModel") as string;
    const certDataStr = formData.get("certData") as string;

    if (!apiKey) {
      return NextResponse.json({
        error: "NVIDIA API key not configured. Go to Settings (gear icon) and enter your API key.",
        processLog: ["❌ No API key provided"],
      }, { status: 400 });
    }

    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided for extraction." }, { status: 400 });
    }

    let certData: any = {};
    try { certData = certDataStr ? JSON.parse(certDataStr) : {}; } catch { certData = {}; }

    const modelToUse = model || "meta/llama-3.1-405b-instruct";
    const visionModelToUse = visionModel || "meta/llama-3.2-11b-vision-instruct";

    processLog.push(`🔧 Using model: ${modelToUse}`);
    processLog.push(`🔧 Vision model: ${visionModelToUse}`);

    // ─── PHASE 1: Extract content from all files ───
    const textContents: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
      const sizeKB = Math.round(file.size / 1024);

      try {
        // ── XLSX / XLS / CSV ──
        if (["xlsx", "xls", "csv", "tsv"].includes(fileExt)) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const wb = XLSX.read(buffer, { type: "array" });
          for (const sheetName of wb.SheetNames) {
            const ws = wb.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });
            if (jsonData.length > 0) {
              const tableStr = jsonData
                .map((row: any) => Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(" | "))
                .join("\n");
              textContents.push(`=== ${file.name} (Sheet: ${sheetName}) ===\n${tableStr}`);
            }
          }
          processLog.push(`✅ ${file.name}: Parsed spreadsheet (${sizeKB}KB)`);
        }
        // ── PDF — always send to vision model for best OCR ──
        else if (fileExt === "pdf") {
          const buffer = Buffer.from(await file.arrayBuffer());
          processLog.push(`📄 ${file.name}: Sending to vision model for OCR (${sizeKB}KB)...`);

          try {
            const ocrResult = await processPDFViaVision(
              buffer,
              file.name,
              apiKey,
              baseUrl,
              visionModelToUse,
              processLog
            );

            if (ocrResult) {
              textContents.push(`=== OCR EXTRACTED (${file.name}) ===\n${ocrResult}`);
              processLog.push(`✅ ${file.name}: Vision OCR complete — ${ocrResult.length} chars extracted`);
            } else {
              processLog.push(`⚠️ ${file.name}: Vision OCR returned no text`);
            }
          } catch (visionErr: any) {
            // Fallback: try pdf-parse text extraction
            processLog.push(`⚠️ ${file.name}: Vision OCR failed (${visionErr.message}), falling back to text extraction...`);
            try {
              const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
              const data = await pdfParse(buffer);
              const pdfText = data.text || "";
              if (pdfText.trim().length > 50) {
                textContents.push(`=== ${file.name} (PDF text fallback) ===\n${pdfText.substring(0, 25000)}`);
                processLog.push(`✅ ${file.name}: Fallback text extraction — ${pdfText.length} chars`);
              } else {
                processLog.push(`❌ ${file.name}: Both vision OCR and text extraction failed`);
              }
            } catch (fallbackErr: any) {
              processLog.push(`❌ ${file.name}: All extraction methods failed — ${fallbackErr.message}`);
            }
          }
        }
        // ── DOCX ──
        else if (fileExt === "docx") {
          const buffer = Buffer.from(await file.arrayBuffer());
          const text = buffer.toString("utf-8");
          const textMatches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
          if (textMatches) {
            const docText = textMatches
              .map(m => m.replace(/<w:t[^>]*>/, "").replace(/<\/w:t>/, ""))
              .join(" ");
            textContents.push(`=== ${file.name} (Word doc) ===\n${docText.substring(0, 15000)}`);
            processLog.push(`✅ ${file.name}: Extracted Word text (${sizeKB}KB)`);
          } else {
            processLog.push(`⚠️ ${file.name}: No text found in DOCX`);
          }
        }
        // ── Images ──
        else if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(fileExt)) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const mimeType = getMimeType(fileExt);
          processLog.push(`🔍 ${file.name}: Running image OCR (${sizeKB}KB)...`);

          try {
            const imgOcrText = await processImageOCR(buffer, file.name, mimeType, apiKey, baseUrl, visionModelToUse);
            if (imgOcrText) {
              textContents.push(`=== OCR: ${file.name} ===\n${imgOcrText}`);
              processLog.push(`✅ ${file.name}: OCR extracted ${imgOcrText.length} chars`);
            } else {
              processLog.push(`⚠️ ${file.name}: OCR returned empty`);
            }
          } catch (imgErr: any) {
            processLog.push(`❌ ${file.name}: Image OCR failed — ${imgErr.message}`);
          }
        }
        // ── Text / JSON ──
        else {
          const buffer = await file.arrayBuffer();
          const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
          textContents.push(`=== ${file.name} ===\n${text.substring(0, 15000)}`);
          processLog.push(`✅ ${file.name}: Read as text (${sizeKB}KB)`);
        }
      } catch (parseErr: any) {
        processLog.push(`❌ ${file.name}: Parse error — ${parseErr.message || "unknown"}`);
      }
    }

    // ─── PHASE 2: Extract structured certificate data via AI ───
    const allContent = textContents.join("\n\n---\n\n");

    if (allContent.trim().length < 20) {
      return NextResponse.json({
        extractedData: null,
        warning: "No extractable text content found in uploaded files. The documents may be empty, encrypted, or in an unsupported format.",
        processLog,
      });
    }

    processLog.push(`🧠 AI extracting payment certificate fields via ${modelToUse}...`);

    const systemPrompt = `You are an expert data extraction AI for Al Ryum Contracting & General Transport LLC (Abu Dhabi, UAE). Your task is to extract payment certificate fields from construction documents and perform the calculations below.

CRITICAL RULES:
1. Return ONLY valid JSON — no markdown, no code fences, no extra text
2. Use "KEEP_EXISTING" for any field you cannot determine from the documents
3. Amounts must be numbers only (no AED symbol, no commas, no currency text)
4. Percentages must be numbers only (no % sign)
5. Dates should be in DD-MMM-YY format (e.g., 26-Mar-26)
6. Extract ALL line items found in the documents with complete details
7. For payment arrays, provide [to_date, previous, this_due] — if only "this_due" is found set the others to 0
8. For appDItems, certified = qty × rate × (pp2 / 100) if certified is not explicitly stated
9. For appAItems: arcGross = arcTotal × (arcPct / 100) if not explicitly stated; contractorGross = contractorTotal × (contractorPct / 100)
10. For appBItems: same gross calculation as appAItems
11. this_due for each payment array = to_date − previous (if to_date and previous are known)

PAYMENT SCHEDULE CALCULATION RULES (apply after extraction):
- grossTotal[col] = advPay[col] + progressPay[col]
- netTotal[col] = grossTotal[col] − retention[col] − advRecovery[col] − contra[col]
- vatAmount[col] = netTotal[col] × (vatRate / 100)
- totalDue[col] = netTotal[col] + vatAmount[col]
- If "this_due" column values are not in the document, derive: this_due = to_date − previous

APPENDIX D — for each line item extract:
- itemNo, desc, unit, qty, rate, amount (= qty×rate), pp1 (supply %), pp2 (installation % or overall %), wirRef, certified
- If pp1 and pp2 are present: certified = amount × pp2 / 100 (unless explicitly stated)
- If only one progress % is shown, put it in pp2

APPENDIX E — for each work package:
- itemNo, desc, lpoRef
- ipa1 through ipa5: format as "AMOUNT (Month-YY)" e.g. "7500 (Nov-25)" — include the month label from the document
- totalCertified = sum of all IPA amounts

Return this exact JSON structure:
{
  "vendorType": "one of: Material, Consultant, Plant and/or Labour Only, Supply and Fix Subcon or KEEP_EXISTING",
  "vendorName": "company name or KEEP_EXISTING",
  "vendorAddr1": "address or KEEP_EXISTING",
  "vendorContact": "phone or KEEP_EXISTING",
  "vendorMob": "mobile or KEEP_EXISTING",
  "vendorFax": "fax or KEEP_EXISTING",
  "licenseNo": "license number or KEEP_EXISTING",
  "licenseExp": "date DD-MMM-YY or KEEP_EXISTING",
  "trnVat": "TRN/VAT number (15 digits) or KEEP_EXISTING",
  "scOrderNo": "SC/PO/LPO order number or KEEP_EXISTING",
  "scOrderDate": "date DD-MMM-YY or KEEP_EXISTING",
  "project": "project name or KEEP_EXISTING",
  "projectNo": "project number or KEEP_EXISTING",
  "certDate": "certificate date DD-MMM-YY or KEEP_EXISTING",
  "certNo": "certificate/IPA number or KEEP_EXISTING",
  "paymentTerms": "payment terms or KEEP_EXISTING",
  "periodEnding": "period e.g. November-24 or KEEP_EXISTING",
  "advancedPayment": "number or KEEP_EXISTING",
  "paymentDueDate": "date DD-MMM-YY or KEEP_EXISTING",
  "advPay": ["to_date_num", "previous_num", "this_due_num"],
  "progressPay": ["to_date_num", "previous_num", "this_due_num"],
  "retention": ["to_date_num", "previous_num", "this_due_num"],
  "advRecovery": ["to_date_num", "previous_num", "this_due_num"],
  "contra": ["to_date_num", "previous_num", "this_due_num"],
  "vatRate": "number e.g. 5 or KEEP_EXISTING",
  "appAItems": [{"desc":"...","contractorTotal":"num","contractorPct":"num","contractorGross":"calculated num","arcTotal":"num","arcPct":"num","arcGross":"calculated num","comment":"..."}],
  "appBItems": [{"voNo":"...","desc":"...","contractorTotal":"num","contractorPct":"num","contractorGross":"calculated num","arcTotal":"num","arcPct":"num","arcGross":"calculated num","comment":"..."}],
  "appCItems": [{"desc":"...","totalDeduction":"num","pct":"num","grossValue":"num"}],
  "appDItems": [{"itemNo":"...","desc":"...","unit":"...","qty":"num","rate":"num","amount":"num","pp1":"num or 0","pp2":"num","wirRef":"...","certified":"num"}],
  "appEItems": [{"itemNo":"...","desc":"...","lpoRef":"...","ipa1":"amount (Month-YY) or empty","ipa2":"...","ipa3":"...","ipa4":"...","ipa5":"...","totalCertified":"num"}],
  "cvcOriginalContract": "number or KEEP_EXISTING",
  "cvcAppendixA": "number or KEEP_EXISTING",
  "cvcAppendixB": "number or KEEP_EXISTING",
  "cvcContra": "number or KEEP_EXISTING",
  "cvcContingency": "number or KEEP_EXISTING",
  "cashFlowComments": "text or KEEP_EXISTING",
  "cashFlowMatch": "Yes/No or KEEP_EXISTING",
  "paymentIssueReasons": "text or KEEP_EXISTING",
  "notes": "any notes or KEEP_EXISTING",
  "preparedBy": "name or KEEP_EXISTING",
  "preparedRole": "role or KEEP_EXISTING",
  "approvedByPM": "name or KEEP_EXISTING",
  "checkedByCostControl": "name or KEEP_EXISTING",
  "projectControlsManager": "name or KEEP_EXISTING",
  "commercialContractsManager": "name or KEEP_EXISTING"
}`;

    const userMessage = `I have uploaded ${files.length} document(s) for a payment certificate. Here is all the extracted content (OCR and text):

${allContent.substring(0, 100000)}

Current certificate data (update only fields you can extract from the documents above):
${JSON.stringify(certData, null, 2)}

Extract ALL payment certificate fields and ALL line items. Apply the calculation rules in the system prompt. Return valid JSON only.`;

    try {
      const aiResponse = await callNvidia(apiKey, baseUrl, modelToUse, [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ], 8192);

      const content = aiResponse.choices?.[0]?.message?.content || "";

      if (!content.trim()) {
        return NextResponse.json({
          extractedData: null,
          warning: "AI returned an empty response. The documents may not contain recognizable payment certificate data.",
          processLog,
        });
      }

      let extractedData;
      try {
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        } else {
          extractedData = JSON.parse(cleaned);
        }
      } catch (parseErr) {
        processLog.push(`⚠️ AI response was not valid JSON. First 300 chars: ${content.substring(0, 300)}...`);
        return NextResponse.json({
          extractedData: null,
          warning: "AI returned data in an unexpected format. Try again or use different documents.",
          rawResponse: content.substring(0, 500),
          processLog,
        });
      }

      const fieldCount = Object.entries(extractedData)
        .filter(([k, v]) => v !== "KEEP_EXISTING" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
        .length;

      const appDItemCount = Array.isArray(extractedData.appDItems) ? extractedData.appDItems.length : 0;
      const appEItemCount = Array.isArray(extractedData.appEItems) ? extractedData.appEItems.length : 0;

      processLog.push(`✅ AI extracted ${fieldCount} certificate fields successfully`);
      if (appDItemCount > 0) processLog.push(`📋 Appendix D: ${appDItemCount} line items`);
      if (appEItemCount > 0) processLog.push(`📋 Appendix E: ${appEItemCount} work packages`);

      return NextResponse.json({
        success: true,
        extractedData,
        processLog,
        sourceTextLength: allContent.length,
      });
    } catch (aiErr: any) {
      processLog.push(`❌ AI extraction failed: ${aiErr.message || "unknown"}`);
      return NextResponse.json({
        extractedData: null,
        error: `AI extraction failed: ${aiErr.message || "Unknown error"}`,
        processLog,
      }, { status: 500 });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Extract cert error:", message);
    return NextResponse.json({ error: `Failed to process documents: ${message}` }, { status: 500 });
  }
}
