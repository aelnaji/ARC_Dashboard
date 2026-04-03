"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { saveAs } from "file-saver";
import { useAppStore } from "@/lib/store";
import {
  Upload,
  FileText,
  X,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileType,
  ImageIcon,
  RotateCcw,
} from "lucide-react";

const AED = v => {
  const n = parseFloat(v) || 0;
  return n.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const num = v => parseFloat(v) || 0;

const TABS = ["Certificate","Internal Request","App A","App B","App C","App D","App E","Approval","Documents"];

const INIT = {
  // Header
  vendorType: "Supply and Fix Subcon",
  vendorName: "Dhilal Al Qamar Tents & Shades Ind LLC",
  vendorAddr1: "Abudhabi, UAE",
  vendorContact: "+971 26328960",
  vendorMob: "+971 55 766 0078",
  vendorFax: "+971 26330932",
  licenseNo: "817676",
  licenseExp: "14-Oct-26",
  trnVat: "100274457900003",
  scOrderNo: "RCT24PORS08050",
  scOrderDate: "29-Nov-24",
  project: "MBZ Package 05",
  projectNo: "RCTP0417",
  certDate: "26-Mar-26",
  certNo: "2",
  paymentTerms: "Paid when Paid or Terms",
  periodEnding: "November-24",
  advancedPayment: "7500",
  paymentDueDate: "",
  // Payment columns [payToDate, previousPayment, thisPaymentDue]
  advPay: ["7500", "7500", ""],
  progressPay: ["22500", "", "22500"],
  retention: ["", "", ""],
  advRecovery: ["7500", "", "7500"],
  contra: ["", "", ""],
  vatRate: "5",
  notes: "",
  // CVC / Internal
  cvcOriginalContract: "25000",
  cvcAppendixA: "",
  cvcAppendixB: "",
  cvcContra: "",
  cvcContingency: "",
  cashFlowComments: "",
  cashFlowMatch: "Yes",
  paymentIssueReasons: "",
  // Appendix A items
  appAItems: [
    { desc: "Advance Payment", contractorTotal: "25000", contractorPct: "", contractorGross: "", arcTotal: "25000", arcPct: "90", arcGross: "22500", comment: "" },
  ],
  // Appendix B items
  appBItems: [
    { voNo: "", desc: "", contractorTotal: "", contractorPct: "0", contractorGross: "", arcTotal: "", arcPct: "0", arcGross: "", comment: "" },
  ],
  // Appendix C items
  appCItems: [
    { desc: "", totalDeduction: "", pct: "0", grossValue: "" },
  ],
  // Appendix D items
  appDItems: [
    { itemNo: "1.0", desc: "Supply & Installation of Umbrella Shade 700Gsm PVC Fabric, Powder Coated GI Post Frame and all accessories for Park 18", unit: "Nos", qty: "2.00", rate: "5000.00", amount: "10000.00", pp1: "", pp2: "90", wirRef: "N/A", certified: "9000.00" },
    { itemNo: "2.0", desc: "Supply & Installation of Umbrella Shade 700Gsm PVC Fabric, Powder Coated GI Post Frame and all accessories for Park 22", unit: "Nos", qty: "1.00", rate: "5000.00", amount: "5000.00", pp1: "", pp2: "90", wirRef: "N/A", certified: "4500.00" },
    { itemNo: "3.0", desc: "Supply & Installation of Umbrella Shade 700Gsm PVC Fabric, Powder Coated GI Post Frame and all accessories for Park 30", unit: "Nos", qty: "2.00", rate: "5000.00", amount: "10000.00", pp1: "", pp2: "90", wirRef: "N/A", certified: "9000.00" },
  ],
  // Appendix E — Payment tracking
  appEItems: [
    { itemNo: "1.0", desc: "Supply & Installation of Umbrella Shade 700Gsm PVC Fabric, Powder Coated GI Post Frame and all accessories", lpoRef: "RCT24PORS08050", ipa1: "7500 (Advance, Nov-25)", ipa2: "15000 (Mar-26)", ipa3: "", ipa4: "", ipa5: "", totalCertified: "22500" },
  ],
  // Approvals
  preparedBy: "Kavindu Kushmal",
  preparedRole: "Senior Surveyor/Surveyor",
  approvedByPM: "",
  checkedByCostControl: "",
  projectControlsManager: "",
  commercialContractsManager: "",
  operationsDirector: { name: "", date: "", status: "Pending" },
  internalAudit: { name: "", date: "", status: "Pending" },
  ceo: { name: "Rafael", date: "", status: "Pending" },
};

function Field({ label, value, onChange, type = "text", className = "", readOnly = false, small = false }) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {label && <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        readOnly={readOnly}
        className={`bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white ${small ? "text-xs" : "text-sm"} ${readOnly ? "opacity-60 cursor-default" : "focus:border-blue-500 focus:outline-none"}`}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3, className = "" }) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {label && <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none resize-none"
      />
    </div>
  );
}

function SectionTitle({ children, color = "blue" }) {
  const colors = { blue: "border-blue-500 text-blue-400", green: "border-green-500 text-green-400", yellow: "border-yellow-500 text-yellow-400", purple: "border-purple-500 text-purple-400", red: "border-red-500 text-red-400" };
  return <h3 className={`text-xs font-bold uppercase tracking-widest border-b pb-1 mb-3 ${colors[color]}`}>{children}</h3>;
}

const ARRAY_FIELDS = ["advPay", "progressPay", "retention", "advRecovery", "contra"];
const OBJECT_ARRAY_FIELDS = ["appAItems", "appBItems", "appDItems", "appCItems", "appEItems"];
const SKIP_FIELDS = new Set(["vendorType", ...ARRAY_FIELDS, ...OBJECT_ARRAY_FIELDS, "operationsDirector", "internalAudit", "ceo", "preparedBy", "preparedRole", "approvedByPM", "checkedByCostControl", "projectControlsManager", "commercialContractsManager", "cashFlowMatch", "paymentIssueReasons"]);

const EMPTY_STATE = {
  vendorType: "",
  vendorName: "",
  vendorAddr1: "",
  vendorContact: "",
  vendorMob: "",
  vendorFax: "",
  licenseNo: "",
  licenseExp: "",
  trnVat: "",
  scOrderNo: "",
  scOrderDate: "",
  project: "",
  projectNo: "",
  certDate: "",
  certNo: "",
  paymentTerms: "",
  periodEnding: "",
  advancedPayment: "",
  paymentDueDate: "",
  advPay: ["", "", ""],
  progressPay: ["", "", ""],
  retention: ["", "", ""],
  advRecovery: ["", "", ""],
  contra: ["", "", ""],
  vatRate: "5",
  notes: "",
  cvcOriginalContract: "",
  cvcAppendixA: "",
  cvcAppendixB: "",
  cvcContra: "",
  cvcContingency: "",
  cashFlowComments: "",
  cashFlowMatch: "Yes",
  paymentIssueReasons: "",
  appAItems: [{ desc: "", contractorTotal: "", contractorPct: "", contractorGross: "", arcTotal: "", arcPct: "", arcGross: "", comment: "" }],
  appBItems: [{ voNo: "", desc: "", contractorTotal: "", contractorPct: "0", contractorGross: "", arcTotal: "", arcPct: "0", arcGross: "", comment: "" }],
  appCItems: [{ desc: "", totalDeduction: "", pct: "0", grossValue: "" }],
  appDItems: [{ itemNo: "", desc: "", unit: "", qty: "", rate: "", amount: "", pp1: "", pp2: "", wirRef: "", certified: "" }],
  appEItems: [{ itemNo: "", desc: "", lpoRef: "", ipa1: "", ipa2: "", ipa3: "", ipa4: "", ipa5: "", totalCertified: "" }],
  preparedBy: "",
  preparedRole: "",
  approvedByPM: "",
  checkedByCostControl: "",
  projectControlsManager: "",
  commercialContractsManager: "",
  operationsDirector: { name: "", date: "", status: "Pending" },
  internalAudit: { name: "", date: "", status: "Pending" },
  ceo: { name: "", date: "", status: "Pending" },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function getFileIcon(type: string) {
  if (type.includes("pdf")) return <FileText className="w-4 h-4 text-red-400" />;
  if (type.includes("image")) return <ImageIcon className="w-4 h-4 text-purple-400" />;
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv")) return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
  if (type.includes("word") || type.includes("document")) return <FileType className="w-4 h-4 text-blue-400" />;
  return <FileText className="w-4 h-4 text-gray-400" />;
}

export default function PaymentCertForm() {
  const [tab, setTab] = useState(0);
  const [d, setD] = useState(INIT);
  const [saved, setSaved] = useState(false);

  // Documents tab state — store actual File objects for FormData upload
  const [files, setFiles] = useState<{ id: string; file: File; name: string; type: string; size: number }[]>([]);
  const [exporting, setExporting] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
  const [extractLog, setExtractLog] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const settings = useAppStore(s => s.settings);

  const set = useCallback((key, val) => setD(p => ({ ...p, [key]: val })), []);
  const setArr = useCallback((key, idx, val) => setD(p => {
    const arr = [...p[key]];
    arr[idx] = val;
    return { ...p, [key]: arr };
  }), []);
  const setArrObj = useCallback((key, idx, field, val) => setD(p => {
    const arr = p[key].map((item, i) => i === idx ? { ...item, [field]: val } : item);
    return { ...p, [key]: arr };
  }), []);
  const addRow = useCallback((key, template) => setD(p => ({ ...p, [key]: [...p[key], { ...template }] })), []);
  const removeRow = useCallback((key, idx) => setD(p => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) })), []);

  // Calculations
  const grossTotalToDate = num(d.advPay[0]) + num(d.progressPay[0]);
  const grossTotalPrev = num(d.advPay[1]) + num(d.progressPay[1]);
  const grossTotalThis = num(d.advPay[2]) + num(d.progressPay[2]);
  const netTotalToDate = grossTotalToDate - num(d.retention[0]) - num(d.advRecovery[0]) - num(d.contra[0]);
  const netTotalPrev = grossTotalPrev - num(d.retention[1]) - num(d.advRecovery[1]) - num(d.contra[1]);
  const netTotalThis = grossTotalThis - num(d.retention[2]) - num(d.advRecovery[2]) - num(d.contra[2]);
  const vr = num(d.vatRate) / 100;
  const vatToDate = netTotalToDate * vr;
  const vatPrev = netTotalPrev * vr;
  const vatThis = netTotalThis * vr;
  const totalToDate = netTotalToDate + vatToDate;
  const totalPrev = netTotalPrev + vatPrev;
  const totalThis = netTotalThis + vatThis;
  const cvcTotal = num(d.cvcOriginalContract) + num(d.cvcAppendixA) + num(d.cvcAppendixB) - num(d.cvcContra) + num(d.cvcContingency);
  const appDTotal = d.appDItems.reduce((s, r) => s + num(r.certified), 0);
  const appETotal = d.appEItems.reduce((s, r) => s + num(r.totalCertified), 0);

  const approvalCount = [d.operationsDirector, d.internalAudit, d.ceo].filter(a => a.status === "Approved").length;

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  // ── File handling ──
  const ACCEPTED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/gif",
  ];

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const mapped = newFiles.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      type: f.type || "unknown",
      size: f.size,
    }));
    setFiles(prev => {
      const updated = [...prev, ...mapped];
      // Auto-trigger extraction on new files using NVIDIA settings
      setTimeout(() => {
        if (!settings.nvidiaApiKey) {
          setExtractMsg({ type: "error", text: "NVIDIA API key not configured. Go to Settings (gear icon) to add your API key first." });
          return;
        }
        const formData = new FormData();
        formData.append("apiKey", settings.nvidiaApiKey);
        formData.append("baseUrl", settings.nvidiaBaseUrl || "https://integrate.api.nvidia.com/v1");
        formData.append("model", settings.nvidiaModel || "meta/llama-3.1-405b-instruct");
        formData.append("visionModel", (settings as any).visionModel || "meta/llama-3.2-11b-vision-instruct");
        formData.append("certData", JSON.stringify(d));
        updated.forEach(f => formData.append("files", f.file));

        setExtracting(true);
        setExtractMsg({ type: "success", text: `⏳ Processing ${mapped.length} file(s) — OCR & AI extraction...` });
        setExtractLog(prev => [...prev, `📤 ${mapped.map(f => f.name).join(", ")} uploaded — auto-extracting...`]);

        fetch("/api/extract-cert", { method: "POST", body: formData })
          .then(r => r.json())
          .then(data => {
            // Check for scanned PDF warnings in the process log
            const hasScannedPdfWarning = data.processLog?.some((log: string) => 
              log.includes('scanned PDF') || log.includes('Scanned PDF')
            );
            
            if (!data.extractedData) {
              // Determine if this is a warning (partial issue) or error (complete failure)
              const isWarning = hasScannedPdfWarning && !data.error;
              setExtractMsg({ 
                type: isWarning ? "warning" : "error", 
                text: data.warning || data.error || "AI could not extract data." 
              });
              setExtractLog(data.processLog || []);
            } else {
              let uc = 0;
              setD(prev => {
                const next = { ...prev };
                for (const [key, val] of Object.entries(data.extractedData)) {
                  if (SKIP_FIELDS.has(key)) continue;
                  if (val === "KEEP_EXISTING" || val === undefined || val === null) continue;
                  if (typeof val === "string" || typeof val === "number") { next[key] = String(val); uc++; }
                }
                for (const key of ARRAY_FIELDS) {
                  if (!data.extractedData[key] || data.extractedData[key] === "KEEP_EXISTING") continue;
                  if (Array.isArray(data.extractedData[key]) && !data.extractedData[key].some((v: any) => v === "KEEP_EXISTING")) { next[key] = data.extractedData[key].map(String); uc++; }
                }
                for (const key of OBJECT_ARRAY_FIELDS) {
                  if (Array.isArray(data.extractedData[key]) && data.extractedData[key].length > 0) { next[key] = data.extractedData[key]; uc++; }
                }
                return next;
              });
              setExtractLog(data.processLog || []);
              
              // Show warning if scanned PDFs were detected, otherwise success
              if (hasScannedPdfWarning) {
                setExtractMsg({ 
                  type: "warning", 
                  text: `✅ Extracted ${uc} field(s), but some scanned PDFs could not be processed. Convert scanned PDFs to images for full OCR.` 
                });
              } else {
                setExtractMsg({ type: "success", text: `✅ Auto-extracted ${uc} field(s) from ${mapped.length} document(s).` });
              }
            }
          })
          .catch(err => setExtractMsg({ type: "error", text: `Auto-extract failed: ${err.message}` }))
          .finally(() => setExtracting(false));
      }, 100);
      return updated;
    });
    setExtractMsg(null);
  }, [d, settings]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  // ── Apply extracted data to certificate fields ──
  const applyExtractedData = useCallback((extracted: any, log: string[], fileCount: number) => {
    let updateCount = 0;

    setD(prev => {
      const next = { ...prev };

      // Handle simple string fields — skip KEEP_EXISTING
      for (const [key, val] of Object.entries(extracted)) {
        if (SKIP_FIELDS.has(key)) continue;
        if (val === "KEEP_EXISTING" || val === undefined || val === null) continue;
        if (typeof val === "string" || typeof val === "number") {
          next[key] = String(val);
          updateCount++;
        }
      }

      // Handle array fields (advPay, progressPay, retention, advRecovery, contra)
      for (const key of ARRAY_FIELDS) {
        if (!extracted[key] || extracted[key] === "KEEP_EXISTING") continue;
        if (Array.isArray(extracted[key])) {
          const hasKeep = extracted[key].some((v: unknown) => v === "KEEP_EXISTING");
          if (!hasKeep) {
            next[key] = extracted[key].map(String);
            updateCount++;
          }
        }
      }

      // Handle object arrays (appAItems, appBItems, appCItems, appDItems, appEItems)
      for (const key of OBJECT_ARRAY_FIELDS) {
        if (!extracted[key] || extracted[key] === "KEEP_EXISTING") continue;
        if (Array.isArray(extracted[key]) && extracted[key].length > 0) {
          next[key] = extracted[key];
          updateCount++;
        }
      }

      return next;
    });

    setExtractLog(log || []);
    setExtractMsg({ type: "success", text: `✅ Extracted ${updateCount} field(s) from ${fileCount} document(s). Fields updated automatically.` });
  }, []);

  // ── Direct AI Extract — uses NVIDIA settings from Settings ──
  const handleExtract = useCallback(async (filesToProcess?: { file: File }[]) => {
    const processFiles = filesToProcess || files;
    if (processFiles.length === 0) {
      setExtractMsg({ type: "error", text: "Please upload at least one document first." });
      return;
    }
    if (!settings.nvidiaApiKey) {
      setExtractMsg({ type: "error", text: "NVIDIA API key not configured. Go to Settings (gear icon) to add your API key first." });
      return;
    }

    setExtracting(true);
    setExtractMsg({ type: "success", text: "⏳ Processing documents — OCR & AI extraction running..." });
    setExtractLog([]);

    try {
      const formData = new FormData();
      formData.append("apiKey", settings.nvidiaApiKey);
      formData.append("baseUrl", settings.nvidiaBaseUrl || "https://integrate.api.nvidia.com/v1");
      formData.append("model", settings.nvidiaModel || "meta/llama-3.1-405b-instruct");
      formData.append("visionModel", (settings as any).visionModel || "meta/llama-3.2-11b-vision-instruct");
      formData.append("certData", JSON.stringify(d));
      processFiles.forEach(f => {
        formData.append("files", f.file);
      });

      const res = await fetch("/api/extract-cert", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setExtractMsg({ type: "error", text: data.error || `Server error (${res.status})` });
        setExtractLog(data.processLog || []);
        setExtracting(false);
        return;
      }

      if (!data.extractedData) {
        // Check if this is just a scanned PDF warning
        const hasScannedPdfWarning = data.processLog?.some((log: string) => 
          log.includes('scanned PDF') || log.includes('Scanned PDF')
        );
        const msgType = hasScannedPdfWarning && !data.error ? "warning" : "error";
        setExtractMsg({ type: msgType, text: data.warning || data.error || "AI could not extract structured data from the documents." });
        setExtractLog(data.processLog || []);
        setExtracting(false);
        return;
      }

      // Check for scanned PDF warnings to show appropriate message
      const hasScannedPdfWarning = data.processLog?.some((log: string) => 
        log.includes('scanned PDF') || log.includes('Scanned PDF')
      );
      
      if (hasScannedPdfWarning) {
        applyExtractedData(data.extractedData, data.processLog || [], processFiles.length);
        setExtractMsg({ 
          type: "warning", 
          text: `✅ Extracted data successfully, but some scanned PDFs could not be OCR'd. Convert PDF pages to images for complete extraction.` 
        });
      } else {
        applyExtractedData(data.extractedData, data.processLog || [], processFiles.length);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error occurred";
      setExtractMsg({ type: "error", text: `Extraction failed: ${msg}` });
    } finally {
      setExtracting(false);
    }
  }, [files, d, applyExtractedData]);

  // ── Export XLSX (via API — fills the official template) ──
  const handleExportXLSX = useCallback(async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export-cert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certData: d,
          computed: {
            grossTotalToDate,
            grossTotalPrev,
            grossTotalThis,
            netTotalToDate,
            netTotalPrev,
            netTotalThis,
            vatToDate,
            vatPrev,
            vatThis,
            totalToDate,
            totalPrev,
            totalThis,
            cvcTotal,
            appDTotal,
            appETotal,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setExtractMsg({ type: "error", text: err.error || `Export failed (${res.status})` });
        return;
      }

      const blob = await res.blob();
      const fileName = `PaymentCert_${d.scOrderNo || "draft"}_IPA${d.certNo || "draft"}.xls`;
      saveAs(blob, fileName);
      setExtractMsg({ type: "success", text: `Exported: ${fileName}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed";
      setExtractMsg({ type: "error", text: msg });
    } finally {
      setExporting(false);
    }
  }, [d, grossTotalToDate, grossTotalPrev, grossTotalThis, netTotalToDate, netTotalPrev, netTotalThis, vatToDate, vatPrev, vatThis, totalToDate, totalPrev, totalThis, cvcTotal, appDTotal, appETotal]);

  // ── Reset to Empty ──
  const handleResetEmpty = useCallback(() => {
    setD({ ...EMPTY_STATE });
    setFiles([]);
    setExtractMsg(null);
    setTab(0);
  }, []);

  // ── Export PDF (Print) ──
  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="printable-cert bg-gray-950 text-gray-100 text-xs rounded-xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-3 py-2 no-print">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">🧾</span>
              <span className="font-bold text-white text-sm">Payment Certificate Generator</span>
              <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700">Component 1</span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">Al Ryum Contracting & General Transport LLC</p>
          </div>
          <div className="flex gap-2 items-center">
            {/* Export XLSX */}
            <button
              onClick={handleResetEmpty}
              className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-200 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors border border-gray-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleExportXLSX}
              disabled={exporting}
              className="flex items-center gap-1 bg-green-800 hover:bg-green-700 text-green-200 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors border border-green-700 disabled:opacity-50 disabled:cursor-wait"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
              <span>{exporting ? "Exporting..." : "Export XLSX"}</span>
            </button>
            {/* Export PDF */}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1 bg-purple-800 hover:bg-purple-700 text-purple-200 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors border border-purple-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <div className={`text-xs px-2 py-1 rounded-full border ${approvalCount === 3 ? "bg-green-900 text-green-300 border-green-700" : approvalCount > 0 ? "bg-yellow-900 text-yellow-300 border-yellow-700" : "bg-gray-800 text-gray-400 border-gray-600"}`}>
              ✓ {approvalCount}/3 Approved
            </div>
            <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors">
              {saved ? "✓ Saved" : "💾 Save Draft"}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex overflow-x-auto bg-gray-900 border-b border-gray-800 no-print">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`shrink-0 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${tab === i ? "text-blue-400 border-b-2 border-blue-400 bg-gray-800" : "text-gray-400 hover:text-gray-200"}`}>
            {i === 7 && approvalCount < 3 && <span className="mr-1 text-yellow-400">⚠</span>}
            {i === 8 && files.length > 0 && <span className="mr-1 text-blue-300">{files.length}</span>}
            {t}
          </button>
        ))}
      </div>

      <div className="p-3 pb-10">

        {/* ─── TAB 0: VENDOR PAYMENT CERTIFICATE ─── */}
        {tab === 0 && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold text-white">VENDOR PAYMENT CERTIFICATE</h2>
                  <p className="text-gray-400">Al Ryum Group of Companies</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-blue-400">ARC</div>
                  <div className="text-xs text-gray-500">AL RYUM GROUP</div>
                </div>
              </div>

              {/* Vendor Type */}
              <SectionTitle color="blue">Vendor Type</SectionTitle>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {["Material","Consultant","Plant and/or Labour Only","Supply and Fix Subcon"].map(vt => (
                  <label key={vt} className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${d.vendorType === vt ? "border-blue-500 bg-blue-950 text-blue-300" : "border-gray-700 text-gray-400"}`}>
                    <input type="radio" checked={d.vendorType === vt} onChange={() => set("vendorType", vt)} className="accent-blue-500" />
                    <span>{vt}</span>
                  </label>
                ))}
              </div>

              {/* Vendor Details + Project Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <SectionTitle color="blue">Vendor Details</SectionTitle>
                  <Field label="Name & Address" value={d.vendorName} onChange={v => set("vendorName", v)} />
                  <Field label="Address" value={d.vendorAddr1} onChange={v => set("vendorAddr1", v)} />
                  <div className="grid grid-cols-3 gap-1">
                    <Field label="Contact" value={d.vendorContact} onChange={v => set("vendorContact", v)} small />
                    <Field label="Mobile" value={d.vendorMob} onChange={v => set("vendorMob", v)} small />
                    <Field label="Fax" value={d.vendorFax} onChange={v => set("vendorFax", v)} small />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <Field label="License No" value={d.licenseNo} onChange={v => set("licenseNo", v)} small />
                    <Field label="License Exp" value={d.licenseExp} onChange={v => set("licenseExp", v)} small />
                    <Field label="TRN / VAT No" value={d.trnVat} onChange={v => set("trnVat", v)} small />
                    <Field label="S/C Order No" value={d.scOrderNo} onChange={v => set("scOrderNo", v)} small />
                    <Field label="S/C Order Date" value={d.scOrderDate} onChange={v => set("scOrderDate", v)} small />
                  </div>
                </div>
                <div className="space-y-2">
                  <SectionTitle color="green">Project Information</SectionTitle>
                  <Field label="Project" value={d.project} onChange={v => set("project", v)} />
                  <Field label="Project Number" value={d.projectNo} onChange={v => set("projectNo", v)} />
                  <div className="grid grid-cols-2 gap-1">
                    <Field label="Certification Date" value={d.certDate} onChange={v => set("certDate", v)} small />
                    <Field label="Certificate No" value={d.certNo} onChange={v => set("certNo", v)} small />
                    <Field label="Payment Terms" value={d.paymentTerms} onChange={v => set("paymentTerms", v)} small />
                    <Field label="Period Ending" value={d.periodEnding} onChange={v => set("periodEnding", v)} small />
                    <Field label="Advanced Payment (AED)" value={d.advancedPayment} onChange={v => set("advancedPayment", v)} small />
                    <Field label="Payment Due Date" value={d.paymentDueDate} onChange={v => set("paymentDueDate", v)} small />
                  </div>
                  <div className="bg-green-950 border border-green-800 rounded p-2 text-xs text-green-300">
                    ✓ VAT: Only apply if TRN available — TRN confirmed
                  </div>
                </div>
              </div>

              {/* Payment Table */}
              <SectionTitle color="yellow">Payment Schedule (AED)</SectionTitle>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="text-left p-2 border border-gray-700 text-gray-300 w-1/3">Item</th>
                      <th className="text-right p-2 border border-gray-700 text-gray-300">Payment To Date</th>
                      <th className="text-right p-2 border border-gray-700 text-gray-300">Previous Payment</th>
                      <th className="text-right p-2 border border-gray-700 text-gray-300 text-blue-300">This Payment Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Advance Payment", "advPay"],
                      ["Progress Payment", "progressPay"],
                    ].map(([label, key]) => (
                      <tr key={key} className="hover:bg-gray-800/50">
                        <td className="p-2 border border-gray-700 text-gray-200">{label}</td>
                        {[0,1,2].map(i => (
                          <td key={i} className="border border-gray-700 p-1">
                            <input type="number" value={d[key][i]} onChange={e => setArr(key, i, e.target.value)}
                              className="w-full bg-transparent text-right text-white focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5" />
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-gray-800 font-bold">
                      <td className="p-2 border border-gray-700 text-white">Gross Total</td>
                      {[grossTotalToDate, grossTotalPrev, grossTotalThis].map((v, i) => (
                        <td key={i} className="p-2 border border-gray-700 text-right text-white">{AED(v)}</td>
                      ))}
                    </tr>
                    <tr className="bg-red-950/30">
                      <td className="p-2 border border-gray-700 text-red-300">Less Retention</td>
                      {[0,1,2].map(i => (
                        <td key={i} className="border border-gray-700 p-1">
                          <input type="number" value={d.retention[i]} onChange={e => setArr("retention", i, e.target.value)}
                            className="w-full bg-transparent text-right text-red-300 focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5" />
                          </td>
                      ))}
                    </tr>
                    <tr className="bg-red-950/30">
                      <td className="p-2 border border-gray-700 text-red-300">Less Advance Payment Recovery</td>
                      {[0,1,2].map(i => (
                        <td key={i} className="border border-gray-700 p-1">
                          <input type="number" value={d.advRecovery[i]} onChange={e => setArr("advRecovery", i, e.target.value)}
                            className="w-full bg-transparent text-right text-red-300 focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5" />
                          </td>
                      ))}
                    </tr>
                    <tr className="bg-red-950/30">
                      <td className="p-2 border border-gray-700 text-red-300">Less Contra Charge / Set Off</td>
                      {[0,1,2].map(i => (
                        <td key={i} className="border border-gray-700 p-1">
                          <input type="number" value={d.contra[i]} onChange={e => setArr("contra", i, e.target.value)}
                            className="w-full bg-transparent text-right text-red-300 focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5" />
                          </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-800 font-bold">
                      <td className="p-2 border border-gray-700 text-white">Net Total</td>
                      {[netTotalToDate, netTotalPrev, netTotalThis].map((v, i) => (
                        <td key={i} className="p-2 border border-gray-700 text-right text-white">{AED(v)}</td>
                      ))}
                    </tr>
                    <tr className="bg-yellow-950/30">
                      <td className="p-2 border border-gray-700 text-yellow-300">
                        Add VAT
                        <input type="number" value={d.vatRate} onChange={e => set("vatRate", e.target.value)}
                          className="ml-2 w-12 bg-gray-800 border border-gray-600 rounded px-1 text-center text-yellow-300 focus:outline-none" />
                        %
                      </td>
                      {[vatToDate, vatPrev, vatThis].map((v, i) => (
                        <td key={i} className="p-2 border border-gray-700 text-right text-yellow-300">{AED(v)}</td>
                      ))}
                    </tr>
                    <tr className="bg-blue-900">
                      <td className="p-2 border border-blue-700 font-black text-white">TOTAL PAYMENT DUE</td>
                      {[totalToDate, totalPrev, totalThis].map((v, i) => (
                        <td key={i} className={`p-2 border border-blue-700 text-right font-black ${i === 2 ? "text-green-300 text-base" : "text-white"}`}>{AED(v)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <TextArea label="Notes" value={d.notes} onChange={v => set("notes", v)} rows={3} />
              </div>

              {/* Summary Box */}
              <div className="mt-4 bg-blue-950/40 border border-blue-800 rounded-lg p-3">
                <p className="text-blue-300 font-bold text-sm">💰 THIS PAYMENT DUE: AED {AED(totalThis)}</p>
                <p className="text-gray-400 text-xs mt-1">
                  Net: AED {AED(netTotalThis)} + VAT ({d.vatRate}%): AED {AED(vatThis)}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  This document has no legal validity if not signed by ARC Chief Executive Officer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 1: INTERNAL REQUEST ─── */}
        {tab === 1 && (
          <div className="space-y-4">
            <div className="bg-red-950/30 border border-red-800 rounded-xl p-3">
              <div className="flex gap-2 items-center mb-1">
                <span className="text-red-400 font-black text-sm">⚠ INTERNAL USE ONLY</span>
              </div>
              <p className="text-red-300 text-xs">DO NOT ISSUE TO VENDOR — This is the internal payment request document</p>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-700 p-3 space-y-4">
              <h3 className="text-sm font-bold text-white">VENDOR PAYMENT REQUEST</h3>
              <p className="text-gray-400 text-xs">Same payment data as Certificate Page 1 — see Certificate tab for payment figures</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <SectionTitle color="purple">Cash Flow Statement</SectionTitle>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs w-40">Does payment match or better the cash flow?</span>
                      <div className="flex gap-2">
                        {["Yes","No"].map(v => (
                          <label key={v} className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer ${d.cashFlowMatch === v ? "border-purple-500 bg-purple-950 text-purple-300" : "border-gray-700 text-gray-400"}`}>
                            <input type="radio" checked={d.cashFlowMatch === v} onChange={() => set("cashFlowMatch", v)} className="accent-purple-500" />
                            <span className="text-xs">{v}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <TextArea label="Comments" value={d.cashFlowComments} onChange={v => set("cashFlowComments", v)} rows={3} />
                    <TextArea label="Reasons payment should NOT be made" value={d.paymentIssueReasons} onChange={v => set("paymentIssueReasons", v)} rows={2} />
                  </div>
                </div>

                <div>
                  <SectionTitle color="green">CVC Statement (AED)</SectionTitle>
                  <div className="space-y-1.5">
                    {[
                      ["Original Contract Sum", "cvcOriginalContract"],
                      ["Appendix A (Variations)", "cvcAppendixA"],
                      ["Additional Works Appendix B", "cvcAppendixB"],
                      ["Contra Charge & Set Off / Appendix C", "cvcContra"],
                      ["Contingency", "cvcContingency"],
                    ].map(([label, key]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-gray-400 flex-1 text-xs">{label}</span>
                        <input type="number" value={d[key]} onChange={e => set(key, e.target.value)}
                          className="w-28 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-right text-white text-xs focus:outline-none focus:border-green-500" />
                      </div>
                    ))}
                    <div className="flex items-center gap-2 border-t border-gray-700 pt-1">
                      <span className="text-green-400 font-bold flex-1">Total CVC Value</span>
                      <span className="w-28 text-right text-green-400 font-bold">AED {AED(cvcTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <SectionTitle color="yellow">Internal Sign-Off Chain</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Prepared By", "preparedBy", "preparedRole"],
                  ["Approved By (Project Director/Manager)", "approvedByPM", null],
                  ["Checked By (Cost Control)", "checkedByCostControl", null],
                  ["Project Controls Manager", "projectControlsManager", null],
                  ["Commercial & Contracts Manager", "commercialContractsManager", null],
                ].map(([label, key, roleKey]) => (
                  <div key={key} className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
                    <p className="text-gray-400 text-xs mb-1">{label}</p>
                    <Field value={d[key]} onChange={v => set(key, v)} />
                    {roleKey && <Field label="Role" value={d[roleKey]} onChange={v => set(roleKey, v)} className="mt-1" small />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: APPENDIX A ─── */}
        {tab === 2 && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-3 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">Interim Application — Appendix A</h3>
              <p className="text-gray-400 text-xs">Original Order Value / Works Complete Statement</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><span className="text-gray-400">Certificate No: </span><span className="text-white">{d.certNo}</span></div>
              <div><span className="text-gray-400">Date: </span><span className="text-white">{d.certDate}</span></div>
              <div><span className="text-gray-400">Contractor: </span><span className="text-white">{d.vendorName}</span></div>
              <div className="col-span-3"><span className="text-gray-400">Project: </span><span className="text-white">{d.project}</span></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-2 border border-gray-700 text-left text-gray-300">Description</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">Contractor Total</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">% Applied</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">Gross Period</th>
                    <th className="p-2 border border-gray-700 text-right text-yellow-300">ARC Total</th>
                    <th className="p-2 border border-gray-700 text-right text-yellow-300">ARC %</th>
                    <th className="p-2 border border-gray-700 text-right text-green-300">ARC Gross</th>
                    <th className="p-2 border border-gray-700 text-gray-300">Comment</th>
                    <th className="p-1 border border-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {d.appAItems.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-800/30">
                      <td className="border border-gray-700 p-1"><input value={row.desc} onChange={e => setArrObj("appAItems", i, "desc", e.target.value)} className="w-full bg-transparent text-white focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5 min-w-32" /></td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.contractorTotal} onChange={e => setArrObj("appAItems", i, "contractorTotal", e.target.value)} className="w-24 bg-transparent text-right text-white focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5" /></td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.contractorPct} onChange={e => setArrObj("appAItems", i, "contractorPct", e.target.value)} className="w-16 bg-transparent text-right text-white focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5" /></td>
                      <td className="border border-gray-700 p-1 text-right text-white">{AED(num(row.contractorTotal) * num(row.contractorPct) / 100)}</td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.arcTotal} onChange={e => setArrObj("appAItems", i, "arcTotal", e.target.value)} className="w-24 bg-transparent text-right text-yellow-300 focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5" /></td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.arcPct} onChange={e => setArrObj("appAItems", i, "arcPct", e.target.value)} className="w-16 bg-transparent text-right text-yellow-300 focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5" /></td>
                      <td className="border border-gray-700 p-1 text-right font-bold text-green-400">{AED(num(row.arcTotal) * num(row.arcPct) / 100)}</td>
                      <td className="border border-gray-700 p-1"><input value={row.comment} onChange={e => setArrObj("appAItems", i, "comment", e.target.value)} className="w-full bg-transparent text-gray-300 focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5" /></td>
                      <td className="border border-gray-700 p-1 text-center"><button onClick={() => removeRow("appAItems", i)} className="text-red-400 hover:text-red-300">✕</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-800 font-bold">
                    <td className="p-2 border border-gray-700 text-white" colSpan={3}>Total</td>
                    <td className="p-2 border border-gray-700 text-right text-white">{AED(d.appAItems.reduce((s,r)=>s+num(r.contractorTotal)*num(r.contractorPct)/100,0))}</td>
                    <td className="p-2 border border-gray-700" colSpan={2}></td>
                    <td className="p-2 border border-gray-700 text-right text-green-400">{AED(d.appAItems.reduce((s,r)=>s+num(r.arcTotal)*num(r.arcPct)/100,0))}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button onClick={() => addRow("appAItems", { desc:"",contractorTotal:"",contractorPct:"0",contractorGross:"",arcTotal:"",arcPct:"0",arcGross:"",comment:"" })}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 border border-blue-800 px-3 py-1 rounded">+ Add Row</button>
          </div>
        )}

        {/* ─── TAB 3: APPENDIX B ─── */}
        {tab === 3 && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-3 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">Interim Application — Appendix B</h3>
              <p className="text-gray-400 text-xs">Additional Works Statement (Variations / VOs)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-2 border border-gray-700 text-left text-gray-300">VO No</th>
                    <th className="p-2 border border-gray-700 text-left text-gray-300">Description</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">Contractor Total</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">%</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">Gross</th>
                    <th className="p-2 border border-gray-700 text-right text-yellow-300">ARC Total</th>
                    <th className="p-2 border border-gray-700 text-right text-yellow-300">ARC %</th>
                    <th className="p-2 border border-gray-700 text-right text-green-300">ARC Gross</th>
                    <th className="p-1 border border-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {d.appBItems.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-800/30">
                      <td className="border border-gray-700 p-1"><input value={row.voNo} onChange={e => setArrObj("appBItems",i,"voNo",e.target.value)} className="w-16 bg-transparent text-white focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1"><input value={row.desc} onChange={e => setArrObj("appBItems",i,"desc",e.target.value)} className="w-full bg-transparent text-white focus:outline-none focus:bg-gray-800 rounded px-1 min-w-28" /></td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.contractorTotal} onChange={e => setArrObj("appBItems",i,"contractorTotal",e.target.value)} className="w-20 bg-transparent text-right text-white focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1 text-gray-400 text-right">{row.contractorPct}%</td>
                      <td className="border border-gray-700 p-1 text-right text-white">{AED(num(row.contractorTotal)*num(row.contractorPct)/100)}</td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.arcTotal} onChange={e => setArrObj("appBItems",i,"arcTotal",e.target.value)} className="w-20 bg-transparent text-right text-yellow-300 focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.arcPct} onChange={e => setArrObj("appBItems",i,"arcPct",e.target.value)} className="w-14 bg-transparent text-right text-yellow-300 focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1 text-right text-green-400 font-bold">{AED(num(row.arcTotal)*num(row.arcPct)/100)}</td>
                      <td className="border border-gray-700 p-1 text-center"><button onClick={() => removeRow("appBItems",i)} className="text-red-400">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => addRow("appBItems",{voNo:"",desc:"",contractorTotal:"",contractorPct:"0",contractorGross:"",arcTotal:"",arcPct:"0",arcGross:"",comment:""})}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 border border-blue-800 px-3 py-1 rounded">+ Add Variation Row</button>
          </div>
        )}

        {/* ─── TAB 4: APPENDIX C ─── */}
        {tab === 4 && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-3 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">Interim Application — Appendix C</h3>
              <p className="text-gray-400 text-xs">Contra Charges and Set Off Charges</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-2 border border-gray-700 text-left text-gray-300">Deduction Description</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">Total Deduction</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">% Applied</th>
                    <th className="p-2 border border-gray-700 text-right text-red-300">Gross Period Value</th>
                    <th className="p-1 border border-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {d.appCItems.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-800/30">
                      <td className="border border-gray-700 p-1"><input value={row.desc} onChange={e => setArrObj("appCItems",i,"desc",e.target.value)} className="w-full bg-transparent text-white focus:outline-none focus:bg-gray-800 rounded px-1 min-w-40" /></td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.totalDeduction} onChange={e => setArrObj("appCItems",i,"totalDeduction",e.target.value)} className="w-24 bg-transparent text-right text-white focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1 text-right text-gray-400">{row.pct}%</td>
                      <td className="border border-gray-700 p-1 text-right text-red-400 font-bold">{AED(num(row.totalDeduction)*num(row.pct)/100)}</td>
                      <td className="border border-gray-700 p-1 text-center"><button onClick={() => removeRow("appCItems",i)} className="text-red-400">✕</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-800 font-bold">
                    <td className="p-2 border border-gray-700 text-white" colSpan={3}>Total Deductions</td>
                    <td className="p-2 border border-gray-700 text-right text-red-400">{AED(d.appCItems.reduce((s,r)=>s+num(r.totalDeduction)*num(r.pct)/100,0))}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button onClick={() => addRow("appCItems",{desc:"",totalDeduction:"",pct:"0",grossValue:""})}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 border border-blue-800 px-3 py-1 rounded">+ Add Deduction</button>
          </div>
        )}

        {/* ─── TAB 5: APPENDIX D ─── */}
        {tab === 5 && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-3 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">Interim Application — Appendix D</h3>
              <p className="text-gray-400 text-xs">Measurement Sheets — Line Items with WIR References</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-2 border border-gray-700 text-left text-gray-300">Item</th>
                    <th className="p-2 border border-gray-700 text-left text-gray-300">Description of Scope</th>
                    <th className="p-2 border border-gray-700 text-center text-gray-300">Unit</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">Qty</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">Rate</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">Amount</th>
                    <th className="p-2 border border-gray-700 text-right text-gray-300">PP1%</th>
                    <th className="p-2 border border-gray-700 text-right text-yellow-300">PP2%</th>
                    <th className="p-2 border border-gray-700 text-center text-blue-300">WIR Ref</th>
                    <th className="p-2 border border-gray-700 text-right text-green-300">Certified</th>
                    <th className="p-1 border border-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {d.appDItems.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-800/30">
                      <td className="border border-gray-700 p-1"><input value={row.itemNo} onChange={e => setArrObj("appDItems",i,"itemNo",e.target.value)} className="w-10 bg-transparent text-white focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1"><input value={row.desc} onChange={e => setArrObj("appDItems",i,"desc",e.target.value)} className="w-full bg-transparent text-white focus:outline-none focus:bg-gray-800 rounded px-1 min-w-40" /></td>
                      <td className="border border-gray-700 p-1"><input value={row.unit} onChange={e => setArrObj("appDItems",i,"unit",e.target.value)} className="w-12 bg-transparent text-center text-white focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.qty} onChange={e => setArrObj("appDItems",i,"qty",e.target.value)} className="w-14 bg-transparent text-right text-white focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.rate} onChange={e => setArrObj("appDItems",i,"rate",e.target.value)} className="w-20 bg-transparent text-right text-white focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1 text-right text-white">{AED(num(row.qty)*num(row.rate))}</td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.pp1} onChange={e => setArrObj("appDItems",i,"pp1",e.target.value)} className="w-12 bg-transparent text-right text-gray-300 focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.pp2} onChange={e => setArrObj("appDItems",i,"pp2",e.target.value)} className="w-12 bg-transparent text-right text-yellow-300 focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1"><input value={row.wirRef} onChange={e => setArrObj("appDItems",i,"wirRef",e.target.value)} className="w-16 bg-transparent text-center text-blue-300 focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1"><input type="number" value={row.certified} onChange={e => setArrObj("appDItems",i,"certified",e.target.value)} className="w-24 bg-transparent text-right text-green-400 font-bold focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1 text-center"><button onClick={() => removeRow("appDItems",i)} className="text-red-400">✕</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-800 font-bold">
                    <td className="p-2 border border-gray-700 text-white" colSpan={9}>Total Amount Certified</td>
                    <td className="p-2 border border-gray-700 text-right text-green-400 text-sm">{AED(appDTotal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button onClick={() => addRow("appDItems",{itemNo:"",desc:"",unit:"Nos",qty:"",rate:"",amount:"",pp1:"",pp2:"0",wirRef:"",certified:""})}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 border border-blue-800 px-3 py-1 rounded">+ Add Line Item</button>
          </div>
        )}

        {/* ─── TAB 6: APPENDIX E ─── */}
        {tab === 6 && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-3 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">Interim Application — Appendix E</h3>
              <p className="text-gray-400 text-xs">Sub-Contractor Account Work Book — Payment Tracking Sheets (IPA History)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-2 border border-gray-700 text-left text-gray-300">Item</th>
                    <th className="p-2 border border-gray-700 text-left text-gray-300">Sub-Contractor Work Package</th>
                    <th className="p-2 border border-gray-700 text-center text-gray-300">LPO Ref</th>
                    <th className="p-2 border border-gray-700 text-center text-blue-300">IPA No.01</th>
                    <th className="p-2 border border-gray-700 text-center text-blue-300">IPA No.02</th>
                    <th className="p-2 border border-gray-700 text-center text-blue-300">IPA No.03</th>
                    <th className="p-2 border border-gray-700 text-center text-blue-300">IPA No.04</th>
                    <th className="p-2 border border-gray-700 text-center text-blue-300">IPA No.05</th>
                    <th className="p-2 border border-gray-700 text-right text-green-300">Total Certified</th>
                    <th className="p-1 border border-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {d.appEItems.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-800/30">
                      <td className="border border-gray-700 p-1"><input value={row.itemNo} onChange={e => setArrObj("appEItems",i,"itemNo",e.target.value)} className="w-10 bg-transparent text-white focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1"><input value={row.desc} onChange={e => setArrObj("appEItems",i,"desc",e.target.value)} className="w-full bg-transparent text-white focus:outline-none focus:bg-gray-800 rounded px-1 min-w-36" /></td>
                      <td className="border border-gray-700 p-1"><input value={row.lpoRef} onChange={e => setArrObj("appEItems",i,"lpoRef",e.target.value)} className="w-24 bg-transparent text-center text-gray-300 focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      {["ipa1","ipa2","ipa3","ipa4","ipa5"].map(k => (
                        <td key={k} className="border border-gray-700 p-1"><input value={row[k]} onChange={e => setArrObj("appEItems",i,k,e.target.value)} className="w-24 bg-transparent text-center text-blue-300 focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      ))}
                      <td className="border border-gray-700 p-1"><input type="number" value={row.totalCertified} onChange={e => setArrObj("appEItems",i,"totalCertified",e.target.value)} className="w-24 bg-transparent text-right text-green-400 font-bold focus:outline-none focus:bg-gray-800 rounded px-1" /></td>
                      <td className="border border-gray-700 p-1 text-center"><button onClick={() => removeRow("appEItems",i)} className="text-red-400">✕</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-800 font-bold">
                    <td className="p-2 border border-gray-700 text-white" colSpan={8}>Total Amount Certified To Date</td>
                    <td className="p-2 border border-gray-700 text-right text-green-400 text-sm">{AED(appETotal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button onClick={() => addRow("appEItems",{itemNo:"",desc:"",lpoRef:"",ipa1:"",ipa2:"",ipa3:"",ipa4:"",ipa5:"",totalCertified:""})}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 border border-blue-800 px-3 py-1 rounded">+ Add Work Package</button>
          </div>
        )}

        {/* ─── TAB 7: APPROVAL ─── */}
        {tab === 7 && (
          <div className="space-y-3">
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-3">
              <SectionTitle color="yellow">Approval Routing — Per ARC Signatory Requirements</SectionTitle>
              <p className="text-gray-400 text-xs mb-3">This document has no legal validity unless signed by ARC Chief Executive Officer</p>
              <div className="space-y-3">
                {[
                  ["Operations Director", "operationsDirector", "blue"],
                  ["Internal Audit", "internalAudit", "purple"],
                  ["C.E.O (Rafael)", "ceo", "green"],
                ].map(([label, key, color]) => {
                  const a = d[key];
                  const statusColors = { Pending: "border-gray-600 bg-gray-800", Approved: "border-green-600 bg-green-950", Rejected: "border-red-600 bg-red-950" };
                  return (
                    <div key={key} className={`rounded-lg border p-3 ${statusColors[a.status]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white text-sm">{label}</span>
                        <div className="flex gap-1">
                          {["Pending","Approved","Rejected"].map(s => (
                            <button key={s} onClick={() => setD(p => ({...p, [key]: {...p[key], status: s}}))}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${a.status === s
                                ? s==="Approved" ? "bg-green-700 border-green-500 text-white"
                                : s==="Rejected" ? "bg-red-700 border-red-500 text-white"
                                : "bg-gray-600 border-gray-400 text-white"
                                : "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200"}`}>
                              {s==="Approved"?"✓ Approve":s==="Rejected"?"✕ Reject":"⏳ Pending"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Signatory Name" value={a.name} onChange={v => setD(p => ({...p, [key]:{...p[key], name:v}}))} small />
                        <Field label="Date" value={a.date} onChange={v => setD(p => ({...p, [key]:{...p[key], date:v}}))} small />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-3">
              <SectionTitle color="green">Certificate Summary</SectionTitle>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Vendor", d.vendorName],
                  ["Project", `${d.project} (${d.projectNo})`],
                  ["S/C Order", d.scOrderNo],
                  ["Certificate No", d.certNo],
                  ["Period", d.periodEnding],
                  ["Cert Date", d.certDate],
                  ["Progress Payment", `AED ${AED(num(d.progressPay[2]))}`],
                  ["Less Advance Recovery", `AED ${AED(num(d.advRecovery[2]))}`],
                  ["Net Total", `AED ${AED(netTotalThis)}`],
                  ["VAT (5%)", `AED ${AED(vatThis)}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-gray-400 w-36 shrink-0">{k}:</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
                <div className="col-span-2 mt-2 p-2 bg-green-950 border border-green-700 rounded">
                  <span className="text-green-300 font-black text-sm">TOTAL THIS PAYMENT DUE: AED {AED(totalThis)}</span>
                </div>
              </div>

              <div className="mt-3 flex gap-2 no-print">
                <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-xs font-bold transition-colors">
                  💾 Save Certificate
                </button>
                <button onClick={handleExportPDF} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-xs font-bold transition-colors">
                  📤 Export PDF
                </button>
              </div>
              {saved && <div className="mt-2 bg-green-900 border border-green-700 text-green-300 rounded p-2 text-xs text-center">✓ Certificate saved successfully</div>}
            </div>
          </div>
        )}

        {/* ─── TAB 8: DOCUMENTS — Direct Upload & Auto-Extract ─── */}
        {tab === 8 && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="bg-blue-950/30 border border-blue-800 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-black text-sm">AI Document Extraction</span>
              </div>
              <p className="text-gray-400 text-xs">Upload documents to automatically extract payment certificate data using NVIDIA AI. Text-based PDFs, Excel files, and images work best. For scanned documents, convert PDF pages to images first.</p>
            </div>

            {/* File format help */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-400 mb-2">Supported Formats:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-gray-300">PDF (text-based)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-gray-300">Excel (XLSX, CSV)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-gray-300">Images (JPG, PNG)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileType className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-gray-300">Scanned PDFs → Convert to images</span>
                </div>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="space-y-3">
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  extracting
                    ? "border-blue-500 bg-blue-950/30"
                    : dragOver
                    ? "border-blue-400 bg-blue-950/40"
                    : "border-gray-600 hover:border-gray-400 bg-gray-900/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.csv,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {extracting ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    <p className="text-blue-300 font-semibold text-sm">Processing Documents...</p>
                    <p className="text-gray-500 text-xs">Running AI extraction — please wait</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-500" />
                    <p className="text-gray-300 font-semibold text-sm">
                      Drop files here or click to upload
                    </p>
                    <p className="text-gray-500 text-xs">
                      Extraction starts automatically after upload
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Uploaded Documents ({files.length})
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExtract()}
                      disabled={extracting}
                      className="flex items-center gap-1 bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {extracting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>{extracting ? "Processing..." : "Re-Extract All"}</span>
                    </button>
                    <button
                      onClick={() => { setFiles([]); setExtractMsg(null); setExtractLog([]); }}
                      className="flex items-center gap-1 bg-red-900/50 hover:bg-red-900 text-red-300 px-2 py-1.5 rounded text-xs transition-colors"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  {files.map(f => {
                    const isPdf = f.name.toLowerCase().endsWith('.pdf');
                    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f.name);
                    const isScannedPdfWarning = isPdf && extractLog.some(log => 
                      log.includes('Scanned PDF') && log.includes(f.name)
                    );
                    return (
                      <div key={f.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${isScannedPdfWarning ? 'bg-yellow-950/30 border-yellow-800' : 'bg-gray-900 border-gray-700'}`}>
                        {getFileIcon(f.type)}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isScannedPdfWarning ? 'text-yellow-300' : 'text-gray-200'}`}>{f.name}</p>
                          <p className="text-gray-500 text-xs">{formatFileSize(f.size)} {isPdf && <span className="text-gray-600">• PDF</span>}{isImage && <span className="text-gray-600">• Image (OCR ready)</span>}</p>
                        </div>
                        {isScannedPdfWarning && (
                          <span className="text-[10px] text-yellow-400 bg-yellow-900/50 px-2 py-0.5 rounded" title="Convert to JPG/PNG for OCR">Scanned PDF</span>
                        )}
                        <button onClick={() => removeFile(f.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {extractLog.some(log => log.includes('scanned PDF')) && (
                  <div className="bg-yellow-950/30 border border-yellow-800 rounded-lg p-3 mt-2">
                    <p className="text-yellow-400 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Scanned PDF Detected
                    </p>
                    <p className="text-yellow-300/80 text-xs mt-1">
                      Scanned PDFs cannot be processed directly. Please convert PDF pages to JPG or PNG images and upload those instead.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Status Message */}
            {extractMsg && (
              <div className={`rounded-lg p-3 border ${
                extractMsg.type === "success"
                  ? "bg-green-950/40 border-green-800"
                  : extractMsg.type === "warning"
                  ? "bg-yellow-950/40 border-yellow-800"
                  : "bg-red-950/40 border-red-800"
              }`}>
                <div className="flex items-start gap-2">
                  {extractMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  ) : extractMsg.type === "warning" ? (
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <p className={`text-xs ${
                    extractMsg.type === "success" 
                      ? "text-green-300" 
                      : extractMsg.type === "warning"
                      ? "text-yellow-300"
                      : "text-red-300"
                  }`}>
                    {extractMsg.text}
                  </p>
                </div>
              </div>
            )}

            {/* Process Log */}
            {extractLog.length > 0 && (
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Process Log</p>
                <div className="space-y-0.5 max-h-48 overflow-y-auto">
                  {extractLog.map((log, i) => (
                    <p key={i} className="text-xs text-gray-400 font-mono">{log}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
