"use client";

import "@/app/print.css";

const AED = (v: unknown) => {
  const n = parseFloat(String(v)) || 0;
  return n.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const num = (v: unknown) => parseFloat(String(v)) || 0;

interface CertData {
  vendorType: string;
  vendorName: string;
  vendorAddr1: string;
  vendorContact: string;
  vendorMob: string;
  vendorFax: string;
  licenseNo: string;
  licenseExp: string;
  trnVat: string;
  scOrderNo: string;
  scOrderDate: string;
  project: string;
  projectNo: string;
  certDate: string;
  certNo: string;
  paymentTerms: string;
  periodEnding: string;
  advancedPayment: string;
  paymentDueDate: string;
  advPay: string[];
  progressPay: string[];
  retention: string[];
  advRecovery: string[];
  contra: string[];
  vatRate: string;
  notes: string;
  cvcOriginalContract: string;
  cvcAppendixA: string;
  cvcAppendixB: string;
  cvcContra: string;
  cvcContingency: string;
  cashFlowComments: string;
  cashFlowMatch: string;
  appAItems: { desc: string; contractorTotal: string; contractorPct: string; arcTotal: string; arcPct: string; comment: string }[];
  appBItems: { voNo: string; desc: string; contractorTotal: string; contractorPct: string; arcTotal: string; arcPct: string }[];
  appCItems: { desc: string; totalDeduction: string; pct: string }[];
  appDItems: { itemNo: string; desc: string; unit: string; qty: string; rate: string; pp1: string; pp2: string; wirRef: string; certified: string }[];
  appEItems: { itemNo: string; desc: string; lpoRef: string; ipa1: string; ipa2: string; ipa3: string; ipa4: string; ipa5: string; totalCertified: string }[];
  preparedBy: string;
  preparedRole: string;
  approvedByPM: string;
  checkedByCostControl: string;
  projectControlsManager: string;
  commercialContractsManager: string;
  operationsDirector: { name: string; date: string; status: string };
  internalAudit: { name: string; date: string; status: string };
  ceo: { name: string; date: string; status: string };
}

interface Computed {
  grossTotalToDate: number; grossTotalPrev: number; grossTotalThis: number;
  netTotalToDate: number; netTotalPrev: number; netTotalThis: number;
  vatToDate: number; vatPrev: number; vatThis: number;
  totalToDate: number; totalPrev: number; totalThis: number;
  cvcTotal: number; appDTotal: number; appETotal: number;
}

interface Props { d: CertData; c: Computed; }

const VENDOR_TYPES = ["Material", "Consultant", "Plant and/or Labour Only", "Supply and Fix Subcon"];

function PageHeader({ title, subtitle, confidential }: { title: string; subtitle?: string; confidential?: boolean }) {
  return (
    <div className="print-header">
      <div>
        <div className="print-logo">ARC</div>
        <div className="print-subtitle">Al Ryum Contracting &amp; General Transport LLC</div>
      </div>
      <div style={{ textAlign: "center", flex: 1, padding: "0 8mm" }}>
        {confidential && <div className="print-confidential">⚠ Internal Use Only — Do Not Issue to Vendor</div>}
        <div className="print-title" style={{ marginTop: confidential ? "1mm" : "0" }}>{title}</div>
        {subtitle && <div className="print-subtitle">{subtitle}</div>}
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="print-subtitle" style={{ fontWeight: 700 }}>AL RYUM GROUP</div>
        <div className="print-subtitle">www.alryum.com</div>
      </div>
    </div>
  );
}

function VendorType({ selected }: { selected: string }) {
  return (
    <div style={{ marginBottom: "3mm" }}>
      <div className="print-section-title">Vendor Type</div>
      <div className="print-vendor-type">
        {VENDOR_TYPES.map(vt => (
          <div key={vt} className={`print-vendor-type-item${selected === vt ? " active" : ""}`}>
            <span className="print-checkbox">{selected === vt ? "✓" : ""}</span>
            <span>{vt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoGrid({ d }: { d: CertData }) {
  return (
    <div className="print-info-grid">
      <div className="print-info-block">
        <div className="print-section-title">Vendor Details</div>
        {([
          ["Name", d.vendorName],
          ["Address", d.vendorAddr1],
          ["Contact", d.vendorContact],
          ["Mobile", d.vendorMob],
          ["Fax", d.vendorFax],
          ["License No", d.licenseNo],
          ["License Exp", d.licenseExp],
          ["TRN / VAT No", d.trnVat],
          ["S/C Order No", d.scOrderNo],
          ["S/C Order Date", d.scOrderDate],
        ] as [string,string][]).map(([l, v]) => v ? (
          <div key={l} className="print-info-row">
            <span className="print-info-label">{l}:</span>
            <span className="print-info-value">{v}</span>
          </div>
        ) : null)}
      </div>
      <div className="print-info-block">
        <div className="print-section-title">Project Information</div>
        {([
          ["Project", d.project],
          ["Project No", d.projectNo],
          ["Certification Date", d.certDate],
          ["Certificate No", d.certNo],
          ["Payment Terms", d.paymentTerms],
          ["Period Ending", d.periodEnding],
          ["Advanced Payment", d.advancedPayment ? `AED ${AED(d.advancedPayment)}` : ""],
          ["Payment Due Date", d.paymentDueDate],
        ] as [string,string][]).map(([l, v]) => v ? (
          <div key={l} className="print-info-row">
            <span className="print-info-label">{l}:</span>
            <span className="print-info-value">{v}</span>
          </div>
        ) : null)}
      </div>
    </div>
  );
}

function PaymentSchedule({ d, c }: Props) {
  const vr = num(d.vatRate);
  return (
    <div>
      <div className="print-section-title">Payment Schedule (AED)</div>
      <table className="print-table">
        <thead>
          <tr>
            <th className="left" style={{ width: "35%" }}>Item</th>
            <th className="right">Payment To Date</th>
            <th className="right">Previous Payment</th>
            <th className="right" style={{ background: "#1a5276" }}>This Payment Due</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Advance Payment</td>
            <td className="right">{AED(d.advPay[0])}</td>
            <td className="right">{AED(d.advPay[1])}</td>
            <td className="right bold">{AED(d.advPay[2])}</td>
          </tr>
          <tr>
            <td>Progress Payment</td>
            <td className="right">{AED(d.progressPay[0])}</td>
            <td className="right">{AED(d.progressPay[1])}</td>
            <td className="right bold">{AED(d.progressPay[2])}</td>
          </tr>
          <tr className="subtotal">
            <td className="bold">Gross Total</td>
            <td className="right bold">{AED(c.grossTotalToDate)}</td>
            <td className="right bold">{AED(c.grossTotalPrev)}</td>
            <td className="right bold">{AED(c.grossTotalThis)}</td>
          </tr>
          <tr className="deduction">
            <td>Less Retention</td>
            <td className="right">{AED(d.retention[0])}</td>
            <td className="right">{AED(d.retention[1])}</td>
            <td className="right bold">{AED(d.retention[2])}</td>
          </tr>
          <tr className="deduction">
            <td>Less Advance Payment Recovery</td>
            <td className="right">{AED(d.advRecovery[0])}</td>
            <td className="right">{AED(d.advRecovery[1])}</td>
            <td className="right bold">{AED(d.advRecovery[2])}</td>
          </tr>
          <tr className="deduction">
            <td>Less Contra Charge / Set Off</td>
            <td className="right">{AED(d.contra[0])}</td>
            <td className="right">{AED(d.contra[1])}</td>
            <td className="right bold">{AED(d.contra[2])}</td>
          </tr>
          <tr className="subtotal">
            <td className="bold">Net Certified Amount</td>
            <td className="right bold">{AED(c.netTotalToDate)}</td>
            <td className="right bold">{AED(c.netTotalPrev)}</td>
            <td className="right bold">{AED(c.netTotalThis)}</td>
          </tr>
          <tr className="vat-row">
            <td>Add VAT ({vr}%)</td>
            <td className="right">{AED(c.vatToDate)}</td>
            <td className="right">{AED(c.vatPrev)}</td>
            <td className="right bold">{AED(c.vatThis)}</td>
          </tr>
          <tr className="subtotal">
            <td className="bold">Net Certified Amount Incl. VAT</td>
            <td className="right bold">{AED(c.totalToDate)}</td>
            <td className="right bold">{AED(c.totalPrev)}</td>
            <td className="right bold">{AED(c.totalThis)}</td>
          </tr>
          <tr className="grand-total">
            <td>TOTAL PAYMENT DUE</td>
            <td className="right">{AED(c.totalToDate)}</td>
            <td className="right">{AED(c.totalPrev)}</td>
            <td className="right" style={{ fontSize: "9pt" }}>{AED(c.totalThis)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function PaymentCertPrint({ d, c }: Props) {
  const statusColor = (s: string) =>
    s === "Approved" ? "approved" : s === "Rejected" ? "rejected" : "pending";
  const statusIcon = (s: string) =>
    s === "Approved" ? "✓ APPROVED" : s === "Rejected" ? "✕ REJECTED" : "⏳ PENDING";

  const cvcTotal = num(d.cvcOriginalContract) + num(d.cvcAppendixA) + num(d.cvcAppendixB) - num(d.cvcContra) + num(d.cvcContingency);

  return (
    <div id="print-root" style={{ display: "none" }} className="print-tab">

      {/* ═══════════ PAGE 1 — CERTIFICATE (External) ═══════════ */}
      <div className="print-page">
        <PageHeader title="Vendor Payment Certificate" subtitle="Al Ryum Group of Companies" />
        <VendorType selected={d.vendorType} />
        <InfoGrid d={d} />
        <PaymentSchedule d={d} c={c} />
        {d.notes && (
          <div style={{ marginTop: "3mm" }}>
            <div className="print-section-title">Notes</div>
            <div className="print-notes">{d.notes}</div>
          </div>
        )}
        <div className="print-amount-box">
          <div>
            <div className="print-amount-label">This Payment Due</div>
            <div className="print-footnote">Net: AED {AED(c.netTotalThis)} + VAT ({d.vatRate}%): AED {AED(c.vatThis)}</div>
            <div className="print-footnote">This document has no legal validity if not signed by ARC CEO</div>
          </div>
          <div className="print-amount-value">AED {AED(c.totalThis)}</div>
        </div>
        <div className="print-approval-grid">
          {([
            ["Operations Director", d.operationsDirector],
            ["Internal Audit", d.internalAudit],
            ["Chief Executive Officer", d.ceo],
          ] as [string, { name: string; date: string; status: string }][]).map(([role, a]) => (
            <div key={role} className="print-sig-block">
              <div className="role">{role}</div>
              <div className="sig-name">{a.name || "__________________________"}</div>
              <div className="print-sig-line" />
              <div className="print-sig-date-line">
                <span>Date: {a.date || "____________"}</span>
                <span className={`sig-status ${statusColor(a.status)}`}>{statusIcon(a.status)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ PAGE 2 — INTERNAL REQUEST ═══════════ */}
      <div className="print-page">
        <PageHeader title="Vendor Payment Request" confidential />
        <VendorType selected={d.vendorType} />
        <InfoGrid d={d} />
        <PaymentSchedule d={d} c={c} />
        <div className="print-two-col" style={{ marginTop: "4mm" }}>
          <div className="print-info-block">
            <div className="print-section-title">Cash Flow Statement</div>
            <div className="print-kv-row">
              <span className="label">Does payment match / better cash flow?</span>
              <span className="value" style={{ fontWeight: 700, color: d.cashFlowMatch === "Yes" ? "#27ae60" : "#c0392b" }}>{d.cashFlowMatch}</span>
            </div>
            {d.cashFlowComments && (
              <div style={{ marginTop: "2mm", fontSize: "7.5pt" }}>
                <div style={{ color: "#555", fontWeight: 600, marginBottom: "1mm" }}>Comments:</div>
                <div>{d.cashFlowComments}</div>
              </div>
            )}
          </div>
          <div className="print-info-block">
            <div className="print-section-title">CVC Statement (AED)</div>
            {([
              ["Original Contract Sum", d.cvcOriginalContract],
              ["Appendix A (Variations)", d.cvcAppendixA],
              ["Additional Works Appendix B", d.cvcAppendixB],
              ["Contra Charge & Set Off / App C", d.cvcContra],
              ["Contingency", d.cvcContingency],
            ] as [string,string][]).map(([l, v]) => (
              <div key={l} className="print-kv-row">
                <span className="label">{l}</span>
                <span className="value">{v ? `AED ${AED(v)}` : "—"}</span>
              </div>
            ))}
            <div className="print-kv-row total">
              <span className="label">Total CVC Value</span>
              <span className="value">AED {AED(cvcTotal)}</span>
            </div>
          </div>
        </div>
        <div className="print-section-title">Internal Sign-Off Chain</div>
        <div className="print-approval-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {([
            ["Prepared By", d.preparedBy, d.preparedRole],
            ["Approved By (PM/PD)", d.approvedByPM, ""],
            ["Checked By (Cost Control)", d.checkedByCostControl, ""],
            ["Project Controls Manager", d.projectControlsManager, ""],
            ["Commercial & Contracts", d.commercialContractsManager, ""],
            ["Operations Director", d.operationsDirector.name, ""],
          ] as [string, string, string][]).map(([role, name]) => (
            <div key={role} className="print-sig-block">
              <div className="role">{role}</div>
              <div className="print-sig-line" />
              <div className="sig-name" style={{ marginTop: "1mm" }}>{name || ""}</div>
              <div className="print-sig-date-line"><span>Date: ______________</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ PAGE 3 — APPENDIX A ═══════════ */}
      <div className="print-page">
        <PageHeader title="Appendix A — Original Order Value / Works Complete" />
        <div className="print-appendix-meta">
          <div><span className="label">Cert No: </span><span className="value">{d.certNo}</span></div>
          <div><span className="label">Date: </span><span className="value">{d.certDate}</span></div>
          <div><span className="label">Contractor: </span><span className="value">{d.vendorName}</span></div>
          <div><span className="label">Project: </span><span className="value">{d.project}</span></div>
        </div>
        <table className="print-table">
          <thead><tr>
            <th className="left" style={{ width: "28%" }}>Description</th>
            <th className="right">Contr. Total</th>
            <th className="right">% Applied</th>
            <th className="right">Gross Period</th>
            <th className="right" style={{ background: "#7d6608" }}>ARC Total</th>
            <th className="right" style={{ background: "#7d6608" }}>ARC %</th>
            <th className="right" style={{ background: "#1e5631" }}>ARC Gross</th>
            <th className="left">Comment</th>
          </tr></thead>
          <tbody>
            {d.appAItems.map((r, i) => (
              <tr key={i}>
                <td>{r.desc}</td>
                <td className="right">{AED(r.contractorTotal)}</td>
                <td className="right">{r.contractorPct}%</td>
                <td className="right">{AED(num(r.contractorTotal)*num(r.contractorPct)/100)}</td>
                <td className="right">{AED(r.arcTotal)}</td>
                <td className="right">{r.arcPct}%</td>
                <td className="right bold">{AED(num(r.arcTotal)*num(r.arcPct)/100)}</td>
                <td>{r.comment}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr>
            <td colSpan={3} className="bold">Total</td>
            <td className="right bold">{AED(d.appAItems.reduce((s,r)=>s+num(r.contractorTotal)*num(r.contractorPct)/100,0))}</td>
            <td colSpan={2}></td>
            <td className="right bold">{AED(d.appAItems.reduce((s,r)=>s+num(r.arcTotal)*num(r.arcPct)/100,0))}</td>
            <td></td>
          </tr></tfoot>
        </table>
      </div>

      {/* ═══════════ PAGE 4 — APPENDIX B ═══════════ */}
      <div className="print-page">
        <PageHeader title="Appendix B — Additional Works / Variations (VOs)" />
        <div className="print-appendix-meta">
          <div><span className="label">Cert No: </span><span className="value">{d.certNo}</span></div>
          <div><span className="label">Date: </span><span className="value">{d.certDate}</span></div>
          <div><span className="label">Contractor: </span><span className="value">{d.vendorName}</span></div>
          <div><span className="label">Project: </span><span className="value">{d.project}</span></div>
        </div>
        <table className="print-table">
          <thead><tr>
            <th className="left">VO No</th>
            <th className="left" style={{ width: "30%" }}>Description</th>
            <th className="right">Contr. Total</th>
            <th className="right">%</th>
            <th className="right">Gross</th>
            <th className="right" style={{ background: "#7d6608" }}>ARC Total</th>
            <th className="right" style={{ background: "#7d6608" }}>ARC %</th>
            <th className="right" style={{ background: "#1e5631" }}>ARC Gross</th>
          </tr></thead>
          <tbody>
            {d.appBItems.map((r, i) => (
              <tr key={i}>
                <td>{r.voNo}</td>
                <td>{r.desc}</td>
                <td className="right">{AED(r.contractorTotal)}</td>
                <td className="right">{r.contractorPct}%</td>
                <td className="right">{AED(num(r.contractorTotal)*num(r.contractorPct)/100)}</td>
                <td className="right">{AED(r.arcTotal)}</td>
                <td className="right">{r.arcPct}%</td>
                <td className="right bold">{AED(num(r.arcTotal)*num(r.arcPct)/100)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr>
            <td colSpan={4} className="bold">Total</td>
            <td className="right bold">{AED(d.appBItems.reduce((s,r)=>s+num(r.contractorTotal)*num(r.contractorPct)/100,0))}</td>
            <td colSpan={2}></td>
            <td className="right bold">{AED(d.appBItems.reduce((s,r)=>s+num(r.arcTotal)*num(r.arcPct)/100,0))}</td>
          </tr></tfoot>
        </table>
      </div>

      {/* ═══════════ PAGE 5 — APPENDIX C ═══════════ */}
      <div className="print-page">
        <PageHeader title="Appendix C — Contra Charges &amp; Set Off" />
        <div className="print-appendix-meta">
          <div><span className="label">Cert No: </span><span className="value">{d.certNo}</span></div>
          <div><span className="label">Date: </span><span className="value">{d.certDate}</span></div>
          <div><span className="label">Contractor: </span><span className="value">{d.vendorName}</span></div>
          <div><span className="label">Project: </span><span className="value">{d.project}</span></div>
        </div>
        <table className="print-table">
          <thead><tr>
            <th className="left" style={{ width: "50%" }}>Deduction Description</th>
            <th className="right">Total Deduction</th>
            <th className="right">% Applied</th>
            <th className="right" style={{ background: "#641e16" }}>Gross Period Value</th>
          </tr></thead>
          <tbody>
            {d.appCItems.map((r, i) => (
              <tr key={i}>
                <td>{r.desc}</td>
                <td className="right">{AED(r.totalDeduction)}</td>
                <td className="right">{r.pct}%</td>
                <td className="right bold" style={{ color: "#c0392b" }}>{AED(num(r.totalDeduction)*num(r.pct)/100)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr>
            <td colSpan={3} className="bold">Total Deductions</td>
            <td className="right bold" style={{ color: "#c0392b" }}>{AED(d.appCItems.reduce((s,r)=>s+num(r.totalDeduction)*num(r.pct)/100,0))}</td>
          </tr></tfoot>
        </table>
      </div>

      {/* ═══════════ PAGE 6 — APPENDIX D ═══════════ */}
      <div className="print-page">
        <PageHeader title="Appendix D — Measurement Sheets" subtitle="Line Items with WIR References" />
        <div className="print-appendix-meta">
          <div><span className="label">Cert No: </span><span className="value">{d.certNo}</span></div>
          <div><span className="label">Date: </span><span className="value">{d.certDate}</span></div>
          <div><span className="label">Contractor: </span><span className="value">{d.vendorName}</span></div>
          <div><span className="label">S/C Order: </span><span className="value">{d.scOrderNo}</span></div>
        </div>
        <table className="print-table">
          <thead><tr>
            <th className="left">Item</th>
            <th className="left" style={{ width: "30%" }}>Description of Scope</th>
            <th className="center">Unit</th>
            <th className="right">Qty</th>
            <th className="right">Rate</th>
            <th className="right">Amount</th>
            <th className="right">PP1%</th>
            <th className="right" style={{ background: "#7d6608" }}>PP2%</th>
            <th className="center">WIR Ref</th>
            <th className="right" style={{ background: "#1e5631" }}>Certified</th>
          </tr></thead>
          <tbody>
            {d.appDItems.map((r, i) => (
              <tr key={i}>
                <td>{r.itemNo}</td>
                <td>{r.desc}</td>
                <td className="center">{r.unit}</td>
                <td className="right">{r.qty}</td>
                <td className="right">{AED(r.rate)}</td>
                <td className="right">{AED(num(r.qty)*num(r.rate))}</td>
                <td className="right">{r.pp1}</td>
                <td className="right">{r.pp2}%</td>
                <td className="center">{r.wirRef}</td>
                <td className="right bold">{AED(r.certified)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr>
            <td colSpan={9} className="bold">Total Amount Certified</td>
            <td className="right bold">{AED(d.appDItems.reduce((s,r)=>s+num(r.certified),0))}</td>
          </tr></tfoot>
        </table>
      </div>

      {/* ═══════════ PAGE 7 — APPENDIX E ═══════════ */}
      <div className="print-page">
        <PageHeader title="Appendix E — Sub-Contractor Account (IPA History)" />
        <div className="print-appendix-meta">
          <div><span className="label">Cert No: </span><span className="value">{d.certNo}</span></div>
          <div><span className="label">Date: </span><span className="value">{d.certDate}</span></div>
          <div><span className="label">Contractor: </span><span className="value">{d.vendorName}</span></div>
          <div><span className="label">Project: </span><span className="value">{d.project}</span></div>
        </div>
        <table className="print-table">
          <thead><tr>
            <th className="left">Item</th>
            <th className="left" style={{ width: "28%" }}>Sub-Contractor Work Package</th>
            <th className="center">LPO Ref</th>
            <th className="center">IPA 01</th>
            <th className="center">IPA 02</th>
            <th className="center">IPA 03</th>
            <th className="center">IPA 04</th>
            <th className="center">IPA 05</th>
            <th className="right" style={{ background: "#1e5631" }}>Total Certified</th>
          </tr></thead>
          <tbody>
            {d.appEItems.map((r, i) => (
              <tr key={i}>
                <td>{r.itemNo}</td>
                <td>{r.desc}</td>
                <td className="center">{r.lpoRef}</td>
                <td className="center">{r.ipa1}</td>
                <td className="center">{r.ipa2}</td>
                <td className="center">{r.ipa3}</td>
                <td className="center">{r.ipa4}</td>
                <td className="center">{r.ipa5}</td>
                <td className="right bold">{AED(r.totalCertified)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr>
            <td colSpan={8} className="bold">Total Amount Certified To Date</td>
            <td className="right bold">{AED(d.appEItems.reduce((s,r)=>s+num(r.totalCertified),0))}</td>
          </tr></tfoot>
        </table>
      </div>

    </div>
  );
}
