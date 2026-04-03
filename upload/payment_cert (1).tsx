import { useState, useCallback } from "react";

const AED = v => {
  const n = parseFloat(v) || 0;
  return n.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const num = v => parseFloat(v) || 0;

const TABS = ["Certificate","Internal Request","App A","App B","App C","App D","App E","Approval"];

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

export default function App() {
  const [tab, setTab] = useState(0);
  const [d, setD] = useState(INIT);
  const [saved, setSaved] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 text-xs">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-3 py-2 sticky top-0 z-20">
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
      <div className="flex overflow-x-auto bg-gray-900 border-b border-gray-800 sticky top-[56px] z-10">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`shrink-0 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${tab === i ? "text-blue-400 border-b-2 border-blue-400 bg-gray-800" : "text-gray-400 hover:text-gray-200"}`}>
            {i === 7 && approvalCount < 3 && <span className="mr-1 text-yellow-400">⚠</span>}
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

              <div className="mt-3 flex gap-2">
                <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-xs font-bold transition-colors">
                  💾 Save Certificate
                </button>
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-xs font-bold transition-colors">
                  📤 Export PDF
                </button>
              </div>
              {saved && <div className="mt-2 bg-green-900 border border-green-700 text-green-300 rounded p-2 text-xs text-center">✓ Certificate saved successfully</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
