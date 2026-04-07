"use client";

import React from "react";

const AED = (v: unknown) => {
  const n = parseFloat(String(v)) || 0;
  return n.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const num = (v: unknown) => parseFloat(String(v)) || 0;

interface PrintData {
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
  paymentIssueReasons: string;
  appAItems: { desc: string; contractorTotal: string; contractorPct: string; contractorGross: string; arcTotal: string; arcPct: string; arcGross: string; comment: string }[];
  appBItems: { voNo: string; desc: string; contractorTotal: string; contractorPct: string; contractorGross: string; arcTotal: string; arcPct: string; arcGross: string; comment: string }[];
  appCItems: { desc: string; totalDeduction: string; pct: string; grossValue: string }[];
  appDItems: { itemNo: string; desc: string; unit: string; qty: string; rate: string; amount: string; pp1: string; pp2: string; wirRef: string; certified: string }[];
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

interface PaymentCertPrintProps {
  d: PrintData;
  computed: {
    grossTotalToDate: number; grossTotalPrev: number; grossTotalThis: number;
    netTotalToDate: number; netTotalPrev: number; netTotalThis: number;
    vatToDate: number; vatPrev: number; vatThis: number;
    totalToDate: number; totalPrev: number; totalThis: number;
    cvcTotal: number; appDTotal: number; appETotal: number;
  };
}

const pageStyle: React.CSSProperties = {
  background: "white",
  color: "#111",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: "9pt",
  padding: "14mm 12mm",
  pageBreakAfter: "always",
  breakAfter: "page",
  minHeight: "270mm",
  boxSizing: "border-box",
  width: "100%",
};

const th: React.CSSProperties = {
  background: "#1e3a5f",
  color: "white",
  padding: "5px 7px",
  border: "1px solid #aaa",
  textAlign: "left",
  fontSize: "8pt",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "4px 7px",
  border: "1px solid #ccc",
  fontSize: "8pt",
  verticalAlign: "middle",
};

const tdR: React.CSSProperties = { ...td, textAlign: "right" };
const tdC: React.CSSProperties = { ...td, textAlign: "center" };

const totalRow: React.CSSProperties = {
  background: "#dbeafe",
  fontWeight: "bold",
};

const sectionHeader: React.CSSProperties = {
  fontWeight: "bold",
  fontSize: "10pt",
  color: "#1e3a5f",
  borderBottom: "2px solid #1e3a5f",
  marginBottom: "8px",
  paddingBottom: "3px",
  marginTop: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

function DocHeader({ certNo, certDate, project, vendor, title, page }: { certNo: string; certDate: string; project: string; vendor: string; title: string; page: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", borderBottom: "3px solid #1e3a5f", paddingBottom: "10px" }}>
      <div>
        <div style={{ fontSize: "18pt", fontWeight: "900", color: "#1e3a5f", letterSpacing: "0.1em", lineHeight: 1 }}>ARC</div>
        <div style={{ fontSize: "7pt", color: "#555", marginTop: "2px" }}>AL RYUM CONTRACTING & GENERAL TRANSPORT LLC</div>
      </div>
      <div style={{ textAlign: "center", flex: 1, padding: "0 20px" }}>
        <div style={{ fontSize: "13pt", fontWeight: "bold", color: "#1e3a5f" }}>{title}</div>
        <div style={{ fontSize: "8pt", color: "#444", marginTop: "2px" }}>{project}</div>
        <div style={{ fontSize: "8pt", color: "#666" }}>{vendor}</div>
      </div>
      <div style={{ textAlign: "right", fontSize: "8pt", color: "#444", minWidth: "120px" }}>
        <div><b>Cert No:</b> {certNo}</div>
        <div><b>Date:</b> {certDate}</div>
        <div style={{ marginTop: "4px", fontSize: "7pt", background: "#1e3a5f", color: "white", padding: "2px 6px", borderRadius: "3px", display: "inline-block" }}>{page}</div>
      </div>
    </div>
  );
}

function InfoGrid({ items }: { items: [string, string][] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
      <tbody>
        {Array.from({ length: Math.ceil(items.length / 2) }, (_, row) => (
          <tr key={row}>
            {items.slice(row * 2, row * 2 + 2).map(([label, value], col) => (
              <React.Fragment key={col}>
                <td style={{ ...td, background: "#f0f4f8", fontWeight: "bold", width: "18%", color: "#1e3a5f" }}>{label}</td>
                <td style={{ ...td, width: "32%" }}>{value || "—"}</td>
              </React.Fragment>
            ))}
            {items.slice(row * 2, row * 2 + 2).length < 2 && <><td style={td}></td><td style={td}></td></>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const PaymentCertPrint = React.forwardRef<HTMLDivElement, PaymentCertPrintProps>(function PaymentCertPrint({ d, computed }, ref) {
  const { grossTotalToDate, grossTotalPrev, grossTotalThis, netTotalToDate, netTotalPrev, netTotalThis, vatToDate, vatPrev, vatThis, totalToDate, totalPrev, totalThis, cvcTotal, appDTotal, appETotal } = computed;

  return (
    <div ref={ref} style={{ background: "white", width: "210mm", margin: "0 auto" }}>

      {/* ══════════════════════════════════════════════════════
          PAGE 1 — VENDOR PAYMENT CERTIFICATE
      ══════════════════════════════════════════════════════ */}
      <div style={pageStyle}>
        <DocHeader certNo={d.certNo} certDate={d.certDate} project={d.project} vendor={d.vendorName} title="VENDOR PAYMENT CERTIFICATE" page="Page 1 of 7" />

        {/* Vendor type */}
        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontWeight: "bold", color: "#1e3a5f", marginRight: "8px" }}>Vendor Type:</span>
          {["Material", "Consultant", "Plant and/or Labour Only", "Supply and Fix Subcon"].map(vt => (
            <span key={vt} style={{ marginRight: "12px", padding: "2px 8px", border: `1px solid ${d.vendorType === vt ? "#1e3a5f" : "#ccc"}`, borderRadius: "3px", background: d.vendorType === vt ? "#dbeafe" : "transparent", fontWeight: d.vendorType === vt ? "bold" : "normal", fontSize: "8pt" }}>
              {d.vendorType === vt ? "☑" : "☐"} {vt}
            </span>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <div style={sectionHeader}>Vendor Details</div>
            <InfoGrid items={[
              ["Name", d.vendorName],
              ["Address", d.vendorAddr1],
              ["Tel", d.vendorContact],
              ["Mobile", d.vendorMob],
              ["Fax", d.vendorFax],
              ["License No", d.licenseNo],
              ["License Exp", d.licenseExp],
              ["TRN / VAT", d.trnVat],
              ["S/C Order No", d.scOrderNo],
              ["S/C Order Date", d.scOrderDate],
            ]} />
          </div>
          <div>
            <div style={sectionHeader}>Project Information</div>
            <InfoGrid items={[
              ["Project", d.project],
              ["Project No", d.projectNo],
              ["Cert Date", d.certDate],
              ["Certificate No", d.certNo],
              ["Payment Terms", d.paymentTerms],
              ["Period Ending", d.periodEnding],
              ["Advanced Payment", `AED ${AED(d.advancedPayment)}`],
              ["Payment Due Date", d.paymentDueDate],
            ]} />
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "4px", padding: "5px 8px", fontSize: "8pt", color: "#166534" }}>
              ✓ VAT at {d.vatRate}% applies — TRN confirmed: {d.trnVat}
            </div>
          </div>
        </div>

        <div style={sectionHeader}>Payment Schedule (AED)</div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "40%" }}>Item</th>
              <th style={{ ...th, textAlign: "right" }}>Payment To Date</th>
              <th style={{ ...th, textAlign: "right" }}>Previous Payment</th>
              <th style={{ ...th, textAlign: "right", background: "#1e4d8c" }}>This Payment Due</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={td}>Advance Payment</td>{[d.advPay[0], d.advPay[1], d.advPay[2]].map((v, i) => <td key={i} style={tdR}>{AED(v)}</td>)}</tr>
            <tr style={{ background: "#fafafa" }}><td style={td}>Progress Payment</td>{[d.progressPay[0], d.progressPay[1], d.progressPay[2]].map((v, i) => <td key={i} style={tdR}>{AED(v)}</td>)}</tr>
            <tr style={totalRow}><td style={td}>Gross Total</td>{[grossTotalToDate, grossTotalPrev, grossTotalThis].map((v, i) => <td key={i} style={tdR}>{AED(v)}</td>)}</tr>
            <tr style={{ background: "#fff5f5" }}><td style={{ ...td, color: "#b91c1c" }}>Less Retention</td>{[d.retention[0], d.retention[1], d.retention[2]].map((v, i) => <td key={i} style={{ ...tdR, color: "#b91c1c" }}>{v ? `(${AED(v)})` : "—"}</td>)}</tr>
            <tr style={{ background: "#fff5f5" }}><td style={{ ...td, color: "#b91c1c" }}>Less Advance Payment Recovery</td>{[d.advRecovery[0], d.advRecovery[1], d.advRecovery[2]].map((v, i) => <td key={i} style={{ ...tdR, color: "#b91c1c" }}>{v ? `(${AED(v)})` : "—"}</td>)}</tr>
            <tr style={{ background: "#fff5f5" }}><td style={{ ...td, color: "#b91c1c" }}>Less Contra Charge / Set Off</td>{[d.contra[0], d.contra[1], d.contra[2]].map((v, i) => <td key={i} style={{ ...tdR, color: "#b91c1c" }}>{v ? `(${AED(v)})` : "—"}</td>)}</tr>
            <tr style={totalRow}><td style={td}>Net Total</td>{[netTotalToDate, netTotalPrev, netTotalThis].map((v, i) => <td key={i} style={tdR}>{AED(v)}</td>)}</tr>
            <tr style={{ background: "#fffbeb" }}><td style={{ ...td, color: "#92400e" }}>Add VAT ({d.vatRate}%)</td>{[vatToDate, vatPrev, vatThis].map((v, i) => <td key={i} style={{ ...tdR, color: "#92400e" }}>{AED(v)}</td>)}</tr>
            <tr style={{ background: "#1e3a5f" }}>
              <td style={{ ...td, color: "white", fontWeight: "bold", fontSize: "9.5pt" }}>TOTAL PAYMENT DUE</td>
              <td style={{ ...tdR, color: "white", fontWeight: "bold" }}>{AED(totalToDate)}</td>
              <td style={{ ...tdR, color: "white", fontWeight: "bold" }}>{AED(totalPrev)}</td>
              <td style={{ ...tdR, color: "#86efac", fontWeight: "bold", fontSize: "11pt" }}>{AED(totalThis)}</td>
            </tr>
          </tbody>
        </table>

        {d.notes && <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "4px", padding: "6px 10px", marginBottom: "10px" }}><b>Notes: </b>{d.notes}</div>}

        <div style={{ background: "#dbeafe", border: "2px solid #1e3a5f", borderRadius: "6px", padding: "10px 14px", marginTop: "auto" }}>
          <div style={{ fontSize: "13pt", fontWeight: "900", color: "#1e3a5f" }}>💰 THIS PAYMENT DUE: AED {AED(totalThis)}</div>
          <div style={{ fontSize: "8pt", color: "#444", marginTop: "3px" }}>Net: AED {AED(netTotalThis)} + VAT ({d.vatRate}%): AED {AED(vatThis)}</div>
          <div style={{ fontSize: "8pt", color: "#b91c1c", marginTop: "3px", fontStyle: "italic" }}>⚠ This document has no legal validity if not signed by ARC Chief Executive Officer</div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          PAGE 2 — INTERNAL PAYMENT REQUEST
      ══════════════════════════════════════════════════════ */}
      <div style={pageStyle}>
        <DocHeader certNo={d.certNo} certDate={d.certDate} project={d.project} vendor={d.vendorName} title="VENDOR PAYMENT REQUEST — INTERNAL USE ONLY" page="Page 2 of 7" />
        <div style={{ background: "#fff5f5", border: "2px solid #fca5a5", borderRadius: "4px", padding: "6px 10px", marginBottom: "12px", color: "#b91c1c", fontSize: "8pt", fontWeight: "bold" }}>⚠ DO NOT ISSUE TO VENDOR — INTERNAL USE ONLY</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <div style={sectionHeader}>Cash Flow Statement</div>
            <InfoGrid items={[
              ["Cash Flow Match", d.cashFlowMatch],
              ["Advanced Payment (AED)", AED(d.advancedPayment)],
            ]} />
            {d.cashFlowComments && <div style={{ marginBottom: "8px" }}><b style={{ fontSize: "8pt" }}>Comments:</b><div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "3px", padding: "5px 8px", fontSize: "8pt", whiteSpace: "pre-wrap", marginTop: "3px" }}>{d.cashFlowComments}</div></div>}
            {d.paymentIssueReasons && <div><b style={{ fontSize: "8pt", color: "#b91c1c" }}>Reasons payment should NOT be made:</b><div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "3px", padding: "5px 8px", fontSize: "8pt", whiteSpace: "pre-wrap", marginTop: "3px" }}>{d.paymentIssueReasons}</div></div>}
          </div>
          <div>
            <div style={sectionHeader}>CVC Statement (AED)</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {([
                  ["Original Contract Sum", d.cvcOriginalContract],
                  ["Appendix A (Variations)", d.cvcAppendixA],
                  ["Additional Works Appendix B", d.cvcAppendixB],
                  ["Contra Charge & Set Off / App C", d.cvcContra],
                  ["Contingency", d.cvcContingency],
                ] as [string, string][]).map(([label, val]) => (
                  <tr key={label}>
                    <td style={{ ...td, background: "#f0f4f8", fontWeight: "bold", color: "#1e3a5f" }}>{label}</td>
                    <td style={tdR}>{AED(val)}</td>
                  </tr>
                ))}
                <tr style={totalRow}><td style={{ ...td, color: "#1e3a5f", fontWeight: "bold" }}>Total CVC Value</td><td style={{ ...tdR, color: "#1e3a5f" }}>AED {AED(cvcTotal)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <div style={sectionHeader}>Internal Sign-Off Chain</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Role</th><th style={th}>Name</th><th style={{ ...th, width: "120px" }}>Signature</th><th style={{ ...th, width: "100px" }}>Date</th></tr></thead>
            <tbody>
              {([
                ["Prepared By", d.preparedBy + (d.preparedRole ? ` (${d.preparedRole})` : "")],
                ["Approved By (Project Director/Manager)", d.approvedByPM],
                ["Checked By (Cost Control)", d.checkedByCostControl],
                ["Project Controls Manager", d.projectControlsManager],
                ["Commercial & Contracts Manager", d.commercialContractsManager],
              ] as [string, string][]).map(([role, name]) => (
                <tr key={role}><td style={td}>{role}</td><td style={td}>{name || ""}</td><td style={td}></td><td style={td}></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          PAGE 3 — APPENDIX A
      ══════════════════════════════════════════════════════ */}
      <div style={pageStyle}>
        <DocHeader certNo={d.certNo} certDate={d.certDate} project={d.project} vendor={d.vendorName} title="APPENDIX A — Original Order Value / Works Complete" page="Page 3 of 7" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
          <InfoGrid items={[["Cert No", d.certNo], ["Date", d.certDate]]} />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "22%" }}>Description</th>
              <th style={{ ...th, textAlign: "right" }}>Contractor Total</th>
              <th style={{ ...th, textAlign: "right" }}>%</th>
              <th style={{ ...th, textAlign: "right" }}>Gross Period</th>
              <th style={{ ...th, textAlign: "right", background: "#92400e" }}>ARC Total</th>
              <th style={{ ...th, textAlign: "right", background: "#92400e" }}>ARC %</th>
              <th style={{ ...th, textAlign: "right", background: "#166534" }}>ARC Gross</th>
              <th style={th}>Comment</th>
            </tr>
          </thead>
          <tbody>
            {d.appAItems.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                <td style={td}>{row.desc}</td>
                <td style={tdR}>{AED(row.contractorTotal)}</td>
                <td style={tdC}>{row.contractorPct}%</td>
                <td style={tdR}>{AED(num(row.contractorTotal) * num(row.contractorPct) / 100)}</td>
                <td style={{ ...tdR, color: "#92400e" }}>{AED(row.arcTotal)}</td>
                <td style={{ ...tdC, color: "#92400e" }}>{row.arcPct}%</td>
                <td style={{ ...tdR, fontWeight: "bold", color: "#166534" }}>{AED(num(row.arcTotal) * num(row.arcPct) / 100)}</td>
                <td style={td}>{row.comment}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={totalRow}>
              <td style={{ ...td, fontWeight: "bold" }} colSpan={3}>Total</td>
              <td style={tdR}>{AED(d.appAItems.reduce((s, r) => s + num(r.contractorTotal) * num(r.contractorPct) / 100, 0))}</td>
              <td colSpan={2} style={td}></td>
              <td style={{ ...tdR, fontWeight: "bold", color: "#166534" }}>{AED(d.appAItems.reduce((s, r) => s + num(r.arcTotal) * num(r.arcPct) / 100, 0))}</td>
              <td style={td}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════
          PAGE 4 — APPENDIX B
      ══════════════════════════════════════════════════════ */}
      <div style={pageStyle}>
        <DocHeader certNo={d.certNo} certDate={d.certDate} project={d.project} vendor={d.vendorName} title="APPENDIX B — Additional Works (Variations / VOs)" page="Page 4 of 7" />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "8%" }}>VO No</th>
              <th style={{ ...th, width: "28%" }}>Description</th>
              <th style={{ ...th, textAlign: "right" }}>Contractor Total</th>
              <th style={{ ...th, textAlign: "right" }}>%</th>
              <th style={{ ...th, textAlign: "right" }}>Gross</th>
              <th style={{ ...th, textAlign: "right", background: "#92400e" }}>ARC Total</th>
              <th style={{ ...th, textAlign: "right", background: "#92400e" }}>ARC %</th>
              <th style={{ ...th, textAlign: "right", background: "#166534" }}>ARC Gross</th>
            </tr>
          </thead>
          <tbody>
            {d.appBItems.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                <td style={tdC}>{row.voNo}</td>
                <td style={td}>{row.desc}</td>
                <td style={tdR}>{AED(row.contractorTotal)}</td>
                <td style={tdC}>{row.contractorPct}%</td>
                <td style={tdR}>{AED(num(row.contractorTotal) * num(row.contractorPct) / 100)}</td>
                <td style={{ ...tdR, color: "#92400e" }}>{AED(row.arcTotal)}</td>
                <td style={{ ...tdC, color: "#92400e" }}>{row.arcPct}%</td>
                <td style={{ ...tdR, fontWeight: "bold", color: "#166534" }}>{AED(num(row.arcTotal) * num(row.arcPct) / 100)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={totalRow}>
              <td style={{ ...td, fontWeight: "bold" }} colSpan={7}>Total Additional Works</td>
              <td style={{ ...tdR, fontWeight: "bold", color: "#166534" }}>{AED(d.appBItems.reduce((s, r) => s + num(r.arcTotal) * num(r.arcPct) / 100, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════
          PAGE 5 — APPENDIX C
      ══════════════════════════════════════════════════════ */}
      <div style={pageStyle}>
        <DocHeader certNo={d.certNo} certDate={d.certDate} project={d.project} vendor={d.vendorName} title="APPENDIX C — Contra Charges & Set Off" page="Page 5 of 7" />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "50%" }}>Deduction Description</th>
              <th style={{ ...th, textAlign: "right" }}>Total Deduction (AED)</th>
              <th style={{ ...th, textAlign: "right" }}>% Applied</th>
              <th style={{ ...th, textAlign: "right", background: "#7f1d1d" }}>Gross Period Value</th>
            </tr>
          </thead>
          <tbody>
            {d.appCItems.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fff5f5" }}>
                <td style={td}>{row.desc}</td>
                <td style={tdR}>{AED(row.totalDeduction)}</td>
                <td style={tdC}>{row.pct}%</td>
                <td style={{ ...tdR, color: "#b91c1c", fontWeight: "bold" }}>{AED(num(row.totalDeduction) * num(row.pct) / 100)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ ...totalRow, background: "#fee2e2" }}>
              <td style={{ ...td, fontWeight: "bold" }} colSpan={3}>Total Deductions</td>
              <td style={{ ...tdR, fontWeight: "bold", color: "#b91c1c" }}>{AED(d.appCItems.reduce((s, r) => s + num(r.totalDeduction) * num(r.pct) / 100, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════
          PAGE 6 — APPENDIX D
      ══════════════════════════════════════════════════════ */}
      <div style={pageStyle}>
        <DocHeader certNo={d.certNo} certDate={d.certDate} project={d.project} vendor={d.vendorName} title="APPENDIX D — Measurement Sheets (Line Items)" page="Page 6 of 7" />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7.5pt" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "5%" }}>Item</th>
              <th style={{ ...th, width: "34%" }}>Description of Scope</th>
              <th style={{ ...th, textAlign: "center", width: "5%" }}>Unit</th>
              <th style={{ ...th, textAlign: "right", width: "7%" }}>Qty</th>
              <th style={{ ...th, textAlign: "right", width: "9%" }}>Rate</th>
              <th style={{ ...th, textAlign: "right", width: "10%" }}>Amount</th>
              <th style={{ ...th, textAlign: "right", width: "6%" }}>PP1%</th>
              <th style={{ ...th, textAlign: "right", width: "6%" }}>PP2%</th>
              <th style={{ ...th, textAlign: "center", width: "8%" }}>WIR Ref</th>
              <th style={{ ...th, textAlign: "right", background: "#166534" }}>Certified</th>
            </tr>
          </thead>
          <tbody>
            {d.appDItems.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                <td style={tdC}>{row.itemNo}</td>
                <td style={td}>{row.desc}</td>
                <td style={tdC}>{row.unit}</td>
                <td style={tdR}>{row.qty}</td>
                <td style={tdR}>{AED(row.rate)}</td>
                <td style={tdR}>{AED(num(row.qty) * num(row.rate))}</td>
                <td style={tdC}>{row.pp1 ? `${row.pp1}%` : "—"}</td>
                <td style={tdC}>{row.pp2}%</td>
                <td style={tdC}>{row.wirRef}</td>
                <td style={{ ...tdR, fontWeight: "bold", color: "#166534" }}>{AED(row.certified)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ ...totalRow, background: "#dcfce7" }}>
              <td style={{ ...td, fontWeight: "bold" }} colSpan={9}>Total Amount Certified</td>
              <td style={{ ...tdR, fontWeight: "bold", color: "#166534", fontSize: "10pt" }}>{AED(appDTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════
          PAGE 7 — APPENDIX E + APPROVAL
      ══════════════════════════════════════════════════════ */}
      <div style={{ ...pageStyle, pageBreakAfter: "avoid", breakAfter: "avoid" }}>
        <DocHeader certNo={d.certNo} certDate={d.certDate} project={d.project} vendor={d.vendorName} title="APPENDIX E — IPA Payment Tracking" page="Page 7 of 7" />
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "18px", fontSize: "7.5pt" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "5%" }}>Item</th>
              <th style={{ ...th, width: "28%" }}>Sub-Contractor Work Package</th>
              <th style={{ ...th, textAlign: "center" }}>LPO Ref</th>
              <th style={{ ...th, textAlign: "center" }}>IPA 01</th>
              <th style={{ ...th, textAlign: "center" }}>IPA 02</th>
              <th style={{ ...th, textAlign: "center" }}>IPA 03</th>
              <th style={{ ...th, textAlign: "center" }}>IPA 04</th>
              <th style={{ ...th, textAlign: "center" }}>IPA 05</th>
              <th style={{ ...th, textAlign: "right", background: "#166534" }}>Total Certified</th>
            </tr>
          </thead>
          <tbody>
            {d.appEItems.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                <td style={tdC}>{row.itemNo}</td>
                <td style={td}>{row.desc}</td>
                <td style={tdC}>{row.lpoRef}</td>
                <td style={tdC}>{row.ipa1}</td>
                <td style={tdC}>{row.ipa2}</td>
                <td style={tdC}>{row.ipa3}</td>
                <td style={tdC}>{row.ipa4}</td>
                <td style={tdC}>{row.ipa5}</td>
                <td style={{ ...tdR, fontWeight: "bold", color: "#166534" }}>{AED(row.totalCertified)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ ...totalRow, background: "#dcfce7" }}>
              <td style={{ ...td, fontWeight: "bold" }} colSpan={8}>Total Amount Certified To Date</td>
              <td style={{ ...tdR, fontWeight: "bold", color: "#166534", fontSize: "10pt" }}>{AED(appETotal)}</td>
            </tr>
          </tfoot>
        </table>

        <div style={sectionHeader}>Approval Routing — ARC Signatory Requirements</div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
          <thead>
            <tr>
              <th style={th}>Signatory</th>
              <th style={th}>Name</th>
              <th style={th}>Status</th>
              <th style={{ ...th, width: "140px" }}>Signature</th>
              <th style={{ ...th, width: "100px" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {([
              ["Operations Director", d.operationsDirector],
              ["Internal Audit", d.internalAudit],
              ["C.E.O", d.ceo],
            ] as [string, { name: string; date: string; status: string }][]).map(([role, a]) => (
              <tr key={role}>
                <td style={td}>{role}</td>
                <td style={td}>{a.name}</td>
                <td style={{ ...tdC, color: a.status === "Approved" ? "#166534" : a.status === "Rejected" ? "#b91c1c" : "#92400e", fontWeight: "bold" }}>
                  {a.status === "Approved" ? "✓ Approved" : a.status === "Rejected" ? "✕ Rejected" : "⏳ Pending"}
                </td>
                <td style={td}></td>
                <td style={td}>{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ border: "2px solid #1e3a5f", borderRadius: "6px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#dbeafe" }}>
          <div>
            <div style={{ fontWeight: "900", fontSize: "11pt", color: "#1e3a5f" }}>TOTAL THIS PAYMENT DUE: AED {AED(totalThis)}</div>
            <div style={{ fontSize: "8pt", color: "#444", marginTop: "2px" }}>Net: AED {AED(computed.netTotalThis)} + VAT ({d.vatRate}%): AED {AED(computed.vatThis)}</div>
            <div style={{ fontSize: "8pt", color: "#b91c1c", marginTop: "2px", fontStyle: "italic" }}>This document has no legal validity if not signed by ARC Chief Executive Officer</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "8pt", color: "#555" }}>S/C Order: {d.scOrderNo}</div>
            <div style={{ fontSize: "8pt", color: "#555" }}>Period: {d.periodEnding}</div>
            <div style={{ fontWeight: "bold", color: "#1e3a5f" }}>Cert No: {d.certNo}</div>
          </div>
        </div>
      </div>

    </div>
  );
});

export default PaymentCertPrint;
