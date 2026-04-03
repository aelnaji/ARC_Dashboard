import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

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

// ── Helper: extract text from PDF ──
async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    const pdfParseModule = await import("pdf-parse");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (err) {
    console.error("PDF parse error:", err);
    // Fallback: try to extract readable text from the raw PDF bytes
    const text = buffer.toString("latin1");
    const matches = text.match(/[\x20-\x7E\n\r\t]{15,}/g);
    if (matches) return matches.map(m => m.trim()).filter(m => m.length > 8).join("\n");
    return "";
  }
}

// ── Helper: convert PDF pages to images using pdf-to-img ──
async function convertPDFToImages(buffer: Buffer, fileName: string, maxPages = 10): Promise<{ uri: string; name: string; type: string }[]> {
  const images: { uri: string; name: string; type: string }[] = [];
  
  try {
    // Use pdf-to-img for reliable PDF to image conversion
    const { pdf } = await import("pdf-to-img");
    
    // Convert PDF to images with high quality for OCR
    const pages = await pdf(buffer, { scale: 2.0 });
    
    let pageNum = 0;
    for await (const imageBuffer of pages) {
      pageNum++;
      if (pageNum > maxPages) break;
      
      // Convert to base64 data URI
      const base64Data = `data:image/png;base64,${imageBuffer.toString("base64")}`;
      
      images.push({
        uri: base64Data,
        name: `${fileName}_page_${pageNum}.png`,
        type: "image/png",
      });
    }
    
    return images;
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

// ── Helper: Check if text appears to be from a scanned PDF (very little extractable text) ──
function isScannedPDF(text: string): boolean {
  const trimmed = text.trim();
  // If less than 100 chars of text, likely a scanned document
  if (trimmed.length < 100) return true;
  // If the text is mostly gibberish (random characters), likely scanned
  const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
  const meaningfulLines = lines.filter(l => /[a-zA-Z]{3,}/.test(l));
  if (meaningfulLines.length < 3 && lines.length > 10) return true;
  return false;
}

export async function POST(request: NextRequest) {
  const processLog: string[] = [];

  try {
    const formData = await request.formData();

    // ─── Read NVIDIA settings from frontend ───
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
    const imageBase64List: { uri: string; name: string; type: string }[] = [];
    const scannedPDFs: { buffer: Buffer; name: string }[] = [];

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
        // ── PDF ──
        else if (fileExt === "pdf") {
          const buffer = Buffer.from(await file.arrayBuffer());
          const pdfText = await extractPDFText(buffer);

          const isScanned = isScannedPDF(pdfText);
          
          if (!isScanned) {
            textContents.push(`=== ${file.name} (PDF text) ===\n${pdfText.substring(0, 25000)}`);
            processLog.push(`✅ ${file.name}: Extracted ${pdfText.length} chars (${sizeKB}KB)`);
          } else {
            // Scanned PDF detected - will convert to images for OCR
            scannedPDFs.push({ buffer, name: file.name });
            processLog.push(`🔍 ${file.name}: Scanned PDF detected (${sizeKB}KB) — will convert to images for OCR`);
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
        // ── Images — send to vision model for OCR ──
        else if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(fileExt)) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const mimeType = getMimeType(fileExt);
          const dataUri = toBase64DataURI(buffer, mimeType);
          imageBase64List.push({ uri: dataUri, name: file.name, type: mimeType });
          processLog.push(`🔍 ${file.name}: Image queued for OCR (${sizeKB}KB)`);
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

    // ─── PHASE 2A: Convert scanned PDFs to images ───
    if (scannedPDFs.length > 0) {
      processLog.push(`🖼️ Converting ${scannedPDFs.length} scanned PDF(s) to images...`);
      
      for (const pdf of scannedPDFs) {
        try {
          const pdfImages = await convertPDFToImages(pdf.buffer, pdf.name);
          
          if (pdfImages.length > 0) {
            imageBase64List.push(...pdfImages);
            processLog.push(`✅ ${pdf.name}: Converted to ${pdfImages.length} image(s)`);
          } else {
            processLog.push(`⚠️ ${pdf.name}: No images generated from conversion`);
          }
        } catch (conversionErr: any) {
          processLog.push(`❌ ${pdf.name}: PDF conversion failed — ${conversionErr.message || "unknown"}`);
        }
      }
    }

    // ─── PHASE 2B: OCR — Use NVIDIA vision model for images ───
    let ocrText = "";

    if (imageBase64List.length > 0) {
      processLog.push(`👁️ Running OCR on ${imageBase64List.length} image(s) via ${visionModelToUse}...`);

      try {
        // Process images one at a time for better results
        for (let i = 0; i < imageBase64List.length; i++) {
          const img = imageBase64List[i];
          
          const visionContent = [
            {
              type: "text",
              text: `You are a precise OCR extraction engine for construction payment certificates. Extract ALL text visible in this image including:

    - Company/vendor names, addresses, phone numbers, fax, mobile
    - License numbers, TRN/VAT/tax registration numbers (often 15 digits)
    - Purchase orders (PO), sub-contract order numbers (SC/PO), dates
    - Project names (e.g. MBZ Package 05), project numbers (e.g. RCTP0417)
    - ALL monetary amounts (AED values), payment figures
    - Line items: item numbers, descriptions, units, quantities, unit rates, amounts
    - Progress % (PP1, PP2), completion percentages
    - Invoice numbers, delivery notes, WIR/MIR references
    - Certificate numbers, dates, period ending (e.g. November-24)
    - Signatories, preparers, approvers and their roles
    - Any tables, schedules, or structured data (extract as accurately as possible)
    
Return the extracted text in a clear, structured format. For tables, use a markdown-like table structure or clear lists. Ensure TRNs and order numbers are extracted with all digits.`,
            },
            {
              type: "image_url",
              image_url: { url: img.uri },
            },
          ];

          // Add page number indicator for PDF pages
          const isPdfPage = img.name.includes("_page_");
          if (isPdfPage) {
            const pageMatch = img.name.match(/_page_(\d+)/);
            const pageNum = pageMatch ? pageMatch[1] : "?";
            processLog.push(`🔄 OCR: Page ${pageNum} of ${img.name.split("_page_")[0]}...`);
          } else {
            processLog.push(`🔄 Processing ${img.name}...`);
          }
          
          // Add small delay between requests to avoid rate limiting
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          const visionResponse = await callNvidia(apiKey, baseUrl, visionModelToUse, [
            { role: "user", content: visionContent },
          ], 4096);

          const imgOcrText = visionResponse.choices?.[0]?.message?.content || "";
          if (imgOcrText) {
            if (isPdfPage) {
              const pageMatch = img.name.match(/_page_(\d+)/);
              const pageNum = pageMatch ? pageMatch[1] : "?";
              ocrText += `\n\n=== OCR: ${img.name.split("_page_")[0]} — Page ${pageNum} ===\n${imgOcrText}`;
              processLog.push(`✅ Page ${pageNum}: OCR extracted ${imgOcrText.length} chars`);
            } else {
              ocrText += `\n\n=== OCR: ${img.name} ===\n${imgOcrText}`;
              processLog.push(`✅ ${img.name}: OCR extracted ${imgOcrText.length} chars`);
            }
          } else {
            processLog.push(`⚠️ ${img.name}: OCR returned empty`);
          }
        }

        if (ocrText) {
          textContents.push(`=== OCR EXTRACTED (${imageBase64List.length} image(s)) ===\n${ocrText}`);
          processLog.push(`✅ OCR complete: ${ocrText.length} total chars extracted from ${imageBase64List.length} image(s)`);
        }
      } catch (ocrErr: any) {
        processLog.push(`❌ OCR failed: ${ocrErr.message || "unknown"}`);
        processLog.push(`💡 Tip: Make sure "${visionModelToUse}" is available on your NVIDIA plan. Try "meta/llama-3.2-11b-vision-instruct" or "microsoft/phi-4-multimodal-instruct". Model needs to support image inputs.`);
      }
    }

    // ─── PHASE 3: Extract structured certificate data via AI ───
    const allContent = textContents.join("\n\n---\n\n");

    if (allContent.trim().length < 20) {
      return NextResponse.json({
        extractedData: null,
        warning: "No extractable text content found in uploaded files. The documents may be empty, encrypted, scanned PDFs without OCR, or in an unsupported format.",
        processLog,
      });
    }

    processLog.push(`🧠 AI extracting payment certificate fields via ${modelToUse}...`);

    const systemPrompt = `You are an expert data extraction AI for Al Ryum Contracting & General Transport LLC (Abu Dhabi, UAE). Your task is to extract payment certificate fields from construction documents.

CRITICAL RULES:
1. Return ONLY valid JSON — no markdown, no code fences, no extra text
2. Use "KEEP_EXISTING" for any field you cannot determine from the documents
3. Amounts must be numbers only (no AED symbol, no commas, no currency text)
4. Percentages must be numbers only (no % sign)
5. Dates should be in DD-MMM-YY format (e.g., 26-Mar-26)
6. Extract ALL line items found in the documents with complete details
7. For payment arrays, provide [to_date, previous, this_due] — if only one value is found, put it as this_due and use "KEEP_EXISTING" for others
8. If you find invoice amounts, payment amounts, or financial values, extract them carefully

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
  "trnVat": "TRN/VAT number or KEEP_EXISTING",
  "scOrderNo": "SC/PO/LPO order number or KEEP_EXISTING",
  "scOrderDate": "date DD-MMM-YY or KEEP_EXISTING",
  "project": "project name or KEEP_EXISTING",
  "projectNo": "project number or KEEP_EXISTING",
  "certDate": "certificate date DD-MMM-YY or KEEP_EXISTING",
  "certNo": "certificate number or KEEP_EXISTING",
  "paymentTerms": "payment terms or KEEP_EXISTING",
  "periodEnding": "period (e.g. November-24) or KEEP_EXISTING",
  "advancedPayment": "number or KEEP_EXISTING",
  "paymentDueDate": "date DD-MMM-YY or KEEP_EXISTING",
  "advPay": ["to_date", "previous", "this_due"] or KEEP_EXISTING,
  "progressPay": ["to_date", "previous", "this_due"] or KEEP_EXISTING,
  "retention": ["to_date", "previous", "this_due"] or KEEP_EXISTING,
  "advRecovery": ["to_date", "previous", "this_due"] or KEEP_EXISTING,
  "contra": ["to_date", "previous", "this_due"] or KEEP_EXISTING,
  "vatRate": "number (e.g. 5) or KEEP_EXISTING",
  "appAItems": [{"desc":"...","contractorTotal":"num","contractorPct":"num","contractorGross":"num","arcTotal":"num","arcPct":"num","arcGross":"num","comment":"..."}],
  "appBItems": [{"voNo":"...","desc":"...","contractorTotal":"num","contractorPct":"num","contractorGross":"num","arcTotal":"num","arcPct":"num","arcGross":"num","comment":"..."}],
  "appCItems": [{"desc":"...","totalDeduction":"num","pct":"num","grossValue":"num"}],
  "appDItems": [{"itemNo":"...","desc":"...","unit":"...","qty":"num","rate":"num","amount":"num","pp1":"num","pp2":"num","wirRef":"...","certified":"num"}],
  "appEItems": [{"itemNo":"...","desc":"...","lpoRef":"...","ipa1":"...","ipa2":"...","ipa3":"...","ipa4":"...","ipa5":"...","totalCertified":"num"}],
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
}

IMPORTANT: If you find line items in the documents (like a bill of quantities, measurement sheet, or scope of work), extract ALL of them into appDItems. Each item should have itemNo, desc, unit, qty, rate, amount, pp2 (completion %), wirRef, and certified value.`;

    const userMessage = `I have uploaded ${files.length} document(s) for a payment certificate. Here is all the extracted content (text and OCR):

${allContent.substring(0, 30000)}

Current certificate data (update only fields you can extract from above):
${JSON.stringify(certData, null, 2)}

Extract payment certificate fields from the documents and return JSON.`;

    try {
      const aiResponse = await callNvidia(apiKey, baseUrl, modelToUse, [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ], 4096);

      const content = aiResponse.choices?.[0]?.message?.content || "";

      if (!content.trim()) {
        return NextResponse.json({
          extractedData: null,
          warning: "AI returned an empty response. The documents may not contain recognizable payment certificate data, or the model may not be responding correctly.",
          processLog,
        });
      }

      // Parse JSON response
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

      // Count extracted fields
      const fieldCount = Object.entries(extractedData)
        .filter(([k, v]) => v !== "KEEP_EXISTING" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
        .length;

      processLog.push(`✅ AI extracted ${fieldCount} certificate fields successfully`);

      return NextResponse.json({
        success: true,
        extractedData,
        processLog,
        ocrTextLength: ocrText.length,
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
