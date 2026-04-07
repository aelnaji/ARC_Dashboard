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
- Payment Schedule rows: Advance Payment, Progress Payment, Gross Total, Retention, Advance Recovery, Contra, Net Total, VAT, Total Due — extract all three columns (TO DATE, PREVIOUS, THIS PAYMENT)
- Appendix A: Description, Contractor Total Value, Contractor %, Contractor Gross, ARC Total Value, ARC %, ARC Gross, Comment
- Appendix B: VO numbers, descriptions, Contractor Total, %, Gross, ARC Total, ARC %, ARC Gross
- Appendix C: Deduction descriptions, Total Deduction, %, Gross Period Value
- Appendix D: BOQ line items — item no, full description, unit, qty, rate, amount, PP1%, PP2%, WIR ref, Material Amount, Installation Amount, Certified Material, Certified Installation, Total Certified
- Appendix E: IPA payment history — work package description, LPO ref, IPA1 amount + month, IPA2 amount + month ... IPA5 amount + month, total certified to date

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

// ── Post-processing: compute derived / calculated fields ──
function applyCalculations(data: any): any {
  const n = (v: any): number => {
    if (v === "KEEP_EXISTING" || v === null || v === undefined || v === "") return 0;
    const parsed = parseFloat(String(v).replace(/,/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  };

  const arr3 = (a: any): [number, number, number] => {
    if (!Array.isArray(a) || a.length < 3) return [0, 0, 0];
    return [n(a[0]), n(a[1]), n(a[2])];
  };

  // Payment schedule columns: [toDate=0, previous=1, thisDue=2]
  const advPay    = arr3(data.advPay);
  const progressPay = arr3(data.progressPay);
  const retention = arr3(data.retention);
  const advRecovery = arr3(data.advRecovery);
  const contra    = arr3(data.contra);
  const vatRate   = n(data.vatRate) || 5;

  // Derive thisDue = toDate - previous if thisDue is missing
  const fix3 = (arr: [number,number,number]): [number,number,number] => {
    if (arr[2] === 0 && arr[0] > 0) return [arr[0], arr[1], arr[0] - arr[1]];
    return arr;
  };

  const ap = fix3(advPay);
  const pp = fix3(progressPay);
  const ret = fix3(retention);
  const ar = fix3(advRecovery);
  const co = fix3(contra);

  // grossTotal per column
  const gross: [number,number,number] = [
    ap[0] + pp[0],
    ap[1] + pp[1],
    ap[2] + pp[2],
  ];

  // netTotal per column
  const net: [number,number,number] = [
    gross[0] - ret[0] - ar[0] - co[0],
    gross[1] - ret[1] - ar[1] - co[1],
    gross[2] - ret[2] - ar[2] - co[2],
  ];

  // vatAmount per column
  const vat: [number,number,number] = [
    +(net[0] * vatRate / 100).toFixed(2),
    +(net[1] * vatRate / 100).toFixed(2),
    +(net[2] * vatRate / 100).toFixed(2),
  ];

  // totalDue per column
  const totalDue: [number,number,number] = [
    +(net[0] + vat[0]).toFixed(2),
    +(net[1] + vat[1]).toFixed(2),
    +(net[2] + vat[2]).toFixed(2),
  ];

  data.advPay       = ap;
  data.progressPay  = pp;
  data.retention    = ret;
  data.advRecovery  = ar;
  data.contra       = co;
  data.grossTotal   = gross;
  data.netTotal     = net;
  data.vatAmount    = vat;
  data.totalDue     = totalDue;

  // Appendix A — compute arcGross and contractorGross if missing
  if (Array.isArray(data.appAItems)) {
    data.appAItems = data.appAItems.map((item: any) => {
      const cT = n(item.contractorTotal);
      const cP = n(item.contractorPct);
      const aT = n(item.arcTotal);
      const aP = n(item.arcPct);
      return {
        ...item,
        contractorGross: item.contractorGross && n(item.contractorGross) !== 0
          ? item.contractorGross
          : +(cT * cP / 100).toFixed(2),
        arcGross: item.arcGross && n(item.arcGross) !== 0
          ? item.arcGross
          : +(aT * aP / 100).toFixed(2),
      };
    });
  }

  // Appendix B — same
  if (Array.isArray(data.appBItems)) {
    data.appBItems = data.appBItems.map((item: any) => {
      const cT = n(item.contractorTotal);
      const cP = n(item.contractorPct);
      const aT = n(item.arcTotal);
      const aP = n(item.arcPct);
      return {
        ...item,
        contractorGross: item.contractorGross && n(item.contractorGross) !== 0
          ? item.contractorGross
          : +(cT * cP / 100).toFixed(2),
        arcGross: item.arcGross && n(item.arcGross) !== 0
          ? item.arcGross
          : +(aT * aP / 100).toFixed(2),
      };
    });
  }

  // Appendix D — compute certified, materialAmt, installationAmt if missing
  if (Array.isArray(data.appDItems)) {
    data.appDItems = data.appDItems.map((item: any) => {
      const qty    = n(item.qty);
      const rate   = n(item.rate);
      const pp2    = n(item.pp2);
      const amount = item.amount && n(item.amount) !== 0 ? n(item.amount) : +(qty * rate).toFixed(2);
      const certified = item.certified && n(item.certified) !== 0
        ? n(item.certified)
        : +(amount * pp2 / 100).toFixed(2);

      // material / installation split
      const matAmt  = item.materialAmt  && n(item.materialAmt)  !== 0 ? n(item.materialAmt)  : 0;
      const instAmt = item.installationAmt && n(item.installationAmt) !== 0 ? n(item.installationAmt) : 0;
      const certMat  = item.certifiedMaterial  && n(item.certifiedMaterial)  !== 0 ? n(item.certifiedMaterial)  : 0;
      const certInst = item.certifiedInstallation && n(item.certifiedInstallation) !== 0 ? n(item.certifiedInstallation) : 0;

      return {
        ...item,
        amount,
        certified,
        materialAmt:  matAmt,
        installationAmt: instAmt,
        certifiedMaterial:  certMat,
        certifiedInstallation: certInst,
      };
    });
  }

  // Appendix E — compute totalCertified from IPA sums if missing
  if (Array.isArray(data.appEItems)) {
    data.appEItems = data.appEItems.map((item: any) => {
      const extractAmt = (val: any): number => {
        if (!val || val === "KEEP_EXISTING") return 0;
        const m = String(val).match(/[\d,]+\.?\d*/);
        return m ? n(m[0]) : 0;
      };
      const total = ["ipa1","ipa2","ipa3","ipa4","ipa5"].reduce((s, k) => s + extractAmt(item[k]), 0);
      return {
        ...item,
        totalCertified: item.totalCertified && n(item.totalCertified) !== 0
          ? n(item.totalCertified)
          : +total.toFixed(2),
      };
    });
  }

  return data;
}

export async function POST(request: NextRequest) {
  const processLog: string[] = [];

  try {
    const formData = await request.formData();

    const apiKey      = formData.get("apiKey") as string;
    const baseUrl     = formData.get("baseUrl") as string;
    const model       = formData.get("model") as string;
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

    const modelToUse       = model        || "meta/llama-3.1-405b-instruct";
    const visionModelToUse = visionModel  || "meta/llama-3.2-11b-vision-instruct";

    processLog.push(`🔧 Using model: ${modelToUse}`);
    processLog.push(`🔧 Vision model: ${visionModelToUse}`);

    // ─── PHASE 1: Extract content from all files ───
    const textContents: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
      const sizeKB  = Math.round(file.size / 1024);

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
        // ── PDF — vision OCR first, fallback to pdf-parse ──
        else if (fileExt === "pdf") {
          const buffer = Buffer.from(await file.arrayBuffer());
          processLog.push(`📄 ${file.name}: Sending to vision model for OCR (${sizeKB}KB)...`);

          try {
            const ocrResult = await processPDFViaVision(
              buffer, file.name, apiKey, baseUrl, visionModelToUse, processLog
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
              const data     = await pdfParse(buffer);
              const pdfText  = data.text || "";
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
          const text   = buffer.toString("utf-8");
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
          const buffer   = Buffer.from(await file.arrayBuffer());
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
          const text   = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
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

    const systemPrompt = `You are an expert data extraction AI for Al Ryum Contracting & General Transport LLC (Abu Dhabi, UAE). Extract payment certificate fields from the construction documents provided and perform all calculations listed below.

CRITICAL RULES:
1. Return ONLY valid JSON — no markdown, no code fences, no extra text
2. Use "KEEP_EXISTING" for any field you cannot determine from the documents
3. Amounts must be numbers only (no AED symbol, no commas, no currency text)
4. Percentages must be numbers only (no % sign)
5. Dates should be in DD-MMM-YY format (e.g., 26-Mar-26)
6. Extract ALL line items found in the documents with complete details
7. For payment arrays use [to_date, previous, this_due] — if only "this_due" is found set others to 0
8. If "to_date" and "previous" are known but "this_due" is not: this_due = to_date − previous

PAYMENT SCHEDULE — extract all three columns [TO DATE, PREVIOUS, THIS PAYMENT] for each row:
- advPay         → Advance Payment row
- progressPay    → Progress Payment row
- retention      → Less Retention row
- advRecovery    → Less Advance Payment Recovery row
- contra         → Less Contra Charge/Set Off row
(grossTotal, netTotal, vatAmount, totalDue will be computed server-side after extraction)

APPENDIX A — for each work package row:
- desc, contractorTotal, contractorPct, contractorGross (= contractorTotal × contractorPct / 100), arcTotal, arcPct, arcGross (= arcTotal × arcPct / 100), comment

APPENDIX B — for each variation order row:
- voNo, desc, contractorTotal, contractorPct, contractorGross, arcTotal, arcPct, arcGross, comment

APPENDIX C — for each deduction row:
- desc, totalDeduction, pct, grossValue

APPENDIX D — for each BOQ line item:
- itemNo, desc, unit, qty, rate, amount (= qty×rate)
- pp1 (supply/material %) and pp2 (installation/overall %)
- wirRef (WIR or MIR reference number)
- materialAmt (material portion of amount — 0 if not split)
- installationAmt (installation portion of amount — 0 if not split)
- certified (= amount × pp2 / 100 if not explicitly stated)
- certifiedMaterial (0 if not split)
- certifiedInstallation (0 if not split)

APPENDIX E — for each work package:
- itemNo, desc, lpoRef
- ipa1 through ipa5: format as "AMOUNT (Month-YY)" e.g. "137430 (Apr-26)"
  — include the month/period label from the document header
  — leave as "" if that IPA column is empty
- totalCertified = sum of all IPA amounts for this package

Return this exact JSON structure:
{
  "vendorType": "Material | Consultant | Plant and/or Labour Only | Supply and Fix Subcon | KEEP_EXISTING",
  "vendorName": "string or KEEP_EXISTING",
  "vendorAddr1": "string or KEEP_EXISTING",
  "vendorContact": "string or KEEP_EXISTING",
  "vendorMob": "string or KEEP_EXISTING",
  "vendorFax": "string or KEEP_EXISTING",
  "licenseNo": "string or KEEP_EXISTING",
  "licenseExp": "DD-MMM-YY or KEEP_EXISTING",
  "trnVat": "15-digit TRN or KEEP_EXISTING",
  "scOrderNo": "string or KEEP_EXISTING",
  "scOrderDate": "DD-MMM-YY or KEEP_EXISTING",
  "project": "string or KEEP_EXISTING",
  "projectNo": "string or KEEP_EXISTING",
  "certDate": "DD-MMM-YY or KEEP_EXISTING",
  "certNo": "string or KEEP_EXISTING",
  "paymentTerms": "string or KEEP_EXISTING",
  "periodEnding": "e.g. April-26 or KEEP_EXISTING",
  "advancedPayment": "number or KEEP_EXISTING",
  "paymentDueDate": "DD-MMM-YY or KEEP_EXISTING",
  "advPay":      [to_date_num, previous_num, this_due_num],
  "progressPay": [to_date_num, previous_num, this_due_num],
  "retention":   [to_date_num, previous_num, this_due_num],
  "advRecovery": [to_date_num, previous_num, this_due_num],
  "contra":      [to_date_num, previous_num, this_due_num],
  "vatRate": 5,
  "appAItems": [{"desc":"","contractorTotal":0,"contractorPct":0,"contractorGross":0,"arcTotal":0,"arcPct":0,"arcGross":0,"comment":""}],
  "appBItems": [{"voNo":"","desc":"","contractorTotal":0,"contractorPct":0,"contractorGross":0,"arcTotal":0,"arcPct":0,"arcGross":0,"comment":""}],
  "appCItems": [{"desc":"","totalDeduction":0,"pct":0,"grossValue":0}],
  "appDItems": [{"itemNo":"","desc":"","unit":"","qty":0,"rate":0,"amount":0,"pp1":0,"pp2":0,"wirRef":"","materialAmt":0,"installationAmt":0,"certified":0,"certifiedMaterial":0,"certifiedInstallation":0}],
  "appEItems": [{"itemNo":"","desc":"","lpoRef":"","ipa1":"","ipa2":"","ipa3":"","ipa4":"","ipa5":"","totalCertified":0}],
  "cvcOriginalContract": "number or KEEP_EXISTING",
  "cvcAppendixA": "number or KEEP_EXISTING",
  "cvcAppendixB": "number or KEEP_EXISTING",
  "cvcContra": "number or KEEP_EXISTING",
  "cvcContingency": "number or KEEP_EXISTING",
  "cashFlowComments": "string or KEEP_EXISTING",
  "cashFlowMatch": "Yes | No | KEEP_EXISTING",
  "paymentIssueReasons": "string or KEEP_EXISTING",
  "notes": "string or KEEP_EXISTING",
  "preparedBy": "string or KEEP_EXISTING",
  "preparedRole": "string or KEEP_EXISTING",
  "approvedByPM": "string or KEEP_EXISTING",
  "checkedByCostControl": "string or KEEP_EXISTING",
  "projectControlsManager": "string or KEEP_EXISTING",
  "commercialContractsManager": "string or KEEP_EXISTING"
}`;

    const userMessage = `I have uploaded ${files.length} document(s) for a payment certificate. Here is all the extracted content (OCR and text):

${allContent.substring(0, 100000)}

Current certificate data (update only fields you can extract from the documents above):
${JSON.stringify(certData, null, 2)}

Extract ALL payment certificate fields and ALL line items from Appendix A, B, C, D, and E. Return valid JSON only.`;

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

      // ─── PHASE 3: Apply server-side calculations ───
      processLog.push(`🔢 Applying Payment Schedule calculations...`);
      extractedData = applyCalculations(extractedData);

      const fieldCount = Object.entries(extractedData)
        .filter(([, v]) => v !== "KEEP_EXISTING" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
        .length;

      const appDItemCount = Array.isArray(extractedData.appDItems) ? extractedData.appDItems.length : 0;
      const appEItemCount = Array.isArray(extractedData.appEItems) ? extractedData.appEItems.length : 0;

      processLog.push(`✅ AI extracted ${fieldCount} certificate fields successfully`);
      if (appDItemCount > 0) processLog.push(`📋 Appendix D: ${appDItemCount} line items extracted`);
      if (appEItemCount > 0) processLog.push(`📋 Appendix E: ${appEItemCount} work packages extracted`);
      processLog.push(`✅ Computed: grossTotal, netTotal, vatAmount, totalDue — all columns`);

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
