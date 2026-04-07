import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

// Helper: write a value into a cell while preserving the original cell style
function setCell(ws: any, addr: string, val: any) {
  if (val === undefined || val === null || val === "") return;

  // Capture any existing style before we touch the cell
  const existingStyle = ws[addr]?.s;

  if (!ws[addr]) ws[addr] = {};

  if (
    typeof val === "number" ||
    (!isNaN(parseFloat(val)) && isFinite(val) && String(val).trim() !== "")
  ) {
    ws[addr].v = parseFloat(val);
    ws[addr].t = "n";
  } else {
    ws[addr].v = String(val);
    ws[addr].t = "s";
  }

  // Restore original style so borders / colours / number-format are kept
  if (existingStyle) ws[addr].s = existingStyle;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const d = body.certData;
    const c = body.computed;

    // Read template
    const templatePath = path.join(process.cwd(), "upload", "PaymentCertificate_Rev06.xls");
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: "Template file not found at upload/PaymentCertificate_Rev06.xls" }, { status: 500 });
    }
    const templateBuffer = fs.readFileSync(templatePath);
    const wb = XLSX.read(templateBuffer, { type: "buffer", cellStyles: true });

    // ─── Certificate_Ext (External) ───
    const ext = wb.Sheets["Certificate_Ext"];
    if (ext) {
      const vtMap: Record<string, string> = {
        "Material": "C8",
        "Consultant": "E8",
        "Plant and/or Labour Only": "F8",
        "Supply and Fix Subcon": "G8",
      };
      for (const [vt, cell] of Object.entries(vtMap)) {
        setCell(ext, cell, d.vendorType === vt ? "✓" : "");
      }

      setCell(ext, "B11", d.vendorName);
      setCell(ext, "B12", d.vendorAddr1);
      setCell(ext, "B13", d.vendorContact || "");
      setCell(ext, "B14", d.vendorMob || "");
      setCell(ext, "B15", d.vendorFax || "");

      setCell(ext, "C19", d.licenseNo);
      setCell(ext, "C20", d.licenseExp);
      setCell(ext, "C21", d.trnVat);
      setCell(ext, "C22", d.scOrderNo);
      setCell(ext, "C23", d.scOrderDate);

      setCell(ext, "G10", d.project);
      setCell(ext, "G11", d.projectNo);
      setCell(ext, "G12", d.certDate);
      setCell(ext, "G13", d.certNo);
      setCell(ext, "G14", d.paymentTerms);
      setCell(ext, "G15", d.periodEnding);
      setCell(ext, "G16", d.advancedPayment);
      setCell(ext, "G17", d.paymentDueDate);

      // Payment Schedule
      setCell(ext, "E27", d.advPay[0] || 0);
      setCell(ext, "F27", d.advPay[1] || 0);
      setCell(ext, "G27", d.advPay[2] || 0);
      setCell(ext, "E29", d.progressPay[0] || 0);
      setCell(ext, "F29", d.progressPay[1] || 0);
      setCell(ext, "G29", d.progressPay[2] || 0);
      setCell(ext, "E31", c.grossTotalToDate);
      setCell(ext, "F31", c.grossTotalPrev);
      setCell(ext, "G31", c.grossTotalThis);
      setCell(ext, "E33", d.retention[0] || 0);
      setCell(ext, "F33", d.retention[1] || 0);
      setCell(ext, "G33", d.retention[2] || 0);
      setCell(ext, "E35", d.advRecovery[0] || 0);
      setCell(ext, "F35", d.advRecovery[1] || 0);
      setCell(ext, "G35", d.advRecovery[2] || 0);
      setCell(ext, "E37", c.netTotalToDate);
      setCell(ext, "F37", c.netTotalPrev);
      setCell(ext, "G37", c.netTotalThis);
      setCell(ext, "C39", d.vatRate);
      setCell(ext, "E39", c.vatToDate);
      setCell(ext, "F39", c.vatPrev);
      setCell(ext, "G39", c.vatThis);
      setCell(ext, "E41", c.totalToDate);
      setCell(ext, "F41", c.totalPrev);
      setCell(ext, "G41", c.totalThis);
      setCell(ext, "E43", d.contra[0] || 0);
      setCell(ext, "F43", d.contra[1] || 0);
      setCell(ext, "G43", d.contra[2] || 0);
      setCell(ext, "C45", d.vatRate);
      setCell(ext, "E45", (parseFloat(d.contra[0]) || 0) * (parseFloat(d.vatRate) || 0) / 100);
      setCell(ext, "F45", (parseFloat(d.contra[1]) || 0) * (parseFloat(d.vatRate) || 0) / 100);
      setCell(ext, "G45", (parseFloat(d.contra[2]) || 0) * (parseFloat(d.vatRate) || 0) / 100);
      setCell(ext, "E47", c.netTotalToDate + c.vatToDate);
      setCell(ext, "F47", c.netTotalPrev + c.vatPrev);
      setCell(ext, "G47", c.netTotalThis + c.vatThis);

      if (d.notes) setCell(ext, "B50", d.notes);

      if (d.operationsDirector) {
        setCell(ext, "B60", d.operationsDirector.name);
        setCell(ext, "E60", d.operationsDirector.date);
      }
      if (d.internalAudit) {
        setCell(ext, "B63", d.internalAudit.name);
        setCell(ext, "E63", d.internalAudit.date);
      }
      if (d.ceo) {
        setCell(ext, "B66", d.ceo.name);
        setCell(ext, "E66", d.ceo.date);
      }
    }

    // ─── Certificate_Int (Internal) ───
    const intSheet = wb.Sheets["Certificate_Int"];
    if (intSheet) {
      const vtMap2: Record<string, string> = {
        "Material": "C8",
        "Consultant": "E8",
        "Plant and/or Labour Only": "F8",
        "Supply and Fix Subcon": "G8",
      };
      for (const [vt, cell] of Object.entries(vtMap2)) {
        setCell(intSheet, cell, d.vendorType === vt ? "✓" : "");
      }

      setCell(intSheet, "B11", d.vendorName);
      setCell(intSheet, "B12", d.vendorAddr1);
      setCell(intSheet, "B13", d.vendorContact || "");
      setCell(intSheet, "B14", d.vendorMob || "");
      setCell(intSheet, "B15", d.vendorFax || "");

      setCell(intSheet, "C19", d.licenseNo);
      setCell(intSheet, "C20", d.licenseExp);
      setCell(intSheet, "C21", d.trnVat);
      setCell(intSheet, "C22", d.scOrderNo);
      setCell(intSheet, "C23", d.scOrderDate);

      setCell(intSheet, "G10", d.project);
      setCell(intSheet, "G11", d.projectNo);
      setCell(intSheet, "G12", d.certDate);
      setCell(intSheet, "G13", d.certNo);
      setCell(intSheet, "G14", d.paymentTerms);
      setCell(intSheet, "G15", d.periodEnding);
      setCell(intSheet, "G16", d.advancedPayment);
      setCell(intSheet, "G17", d.paymentDueDate);

      setCell(intSheet, "E27", d.advPay[0] || 0);
      setCell(intSheet, "F27", d.advPay[1] || 0);
      setCell(intSheet, "G27", d.advPay[2] || 0);
      setCell(intSheet, "E29", d.progressPay[0] || 0);
      setCell(intSheet, "F29", d.progressPay[1] || 0);
      setCell(intSheet, "G29", d.progressPay[2] || 0);
      setCell(intSheet, "E31", c.grossTotalToDate);
      setCell(intSheet, "F31", c.grossTotalPrev);
      setCell(intSheet, "G31", c.grossTotalThis);
      setCell(intSheet, "E33", d.retention[0] || 0);
      setCell(intSheet, "F33", d.retention[1] || 0);
      setCell(intSheet, "G33", d.retention[2] || 0);
      setCell(intSheet, "E35", d.advRecovery[0] || 0);
      setCell(intSheet, "F35", d.advRecovery[1] || 0);
      setCell(intSheet, "G35", d.advRecovery[2] || 0);
      setCell(intSheet, "E37", c.netTotalToDate);
      setCell(intSheet, "F37", c.netTotalPrev);
      setCell(intSheet, "G37", c.netTotalThis);
      setCell(intSheet, "C39", d.vatRate);
      setCell(intSheet, "E39", c.vatToDate);
      setCell(intSheet, "F39", c.vatPrev);
      setCell(intSheet, "G39", c.vatThis);
      setCell(intSheet, "E41", c.totalToDate);
      setCell(intSheet, "F41", c.totalPrev);
      setCell(intSheet, "G41", c.totalThis);
      setCell(intSheet, "E43", d.contra[0] || 0);
      setCell(intSheet, "F43", d.contra[1] || 0);
      setCell(intSheet, "G43", d.contra[2] || 0);
      setCell(intSheet, "C45", d.vatRate);
      setCell(intSheet, "E45", (parseFloat(d.contra[0]) || 0) * (parseFloat(d.vatRate) || 0) / 100);
      setCell(intSheet, "F45", (parseFloat(d.contra[1]) || 0) * (parseFloat(d.vatRate) || 0) / 100);
      setCell(intSheet, "G45", (parseFloat(d.contra[2]) || 0) * (parseFloat(d.vatRate) || 0) / 100);
      setCell(intSheet, "E47", c.netTotalToDate + c.vatToDate);
      setCell(intSheet, "F47", c.netTotalPrev + c.vatPrev);
      setCell(intSheet, "G47", c.netTotalThis + c.vatThis);

      setCell(intSheet, "E59", d.cashFlowMatch === "Yes" ? "Yes" : d.cashFlowMatch === "No" ? "No" : "");
      setCell(intSheet, "E60", d.cashFlowComments);
      setCell(intSheet, "F60", d.cvcOriginalContract);
      setCell(intSheet, "F61", d.cvcAppendixA);
      setCell(intSheet, "F62", d.cvcAppendixB);
      setCell(intSheet, "F63", d.cvcContingency);
      setCell(intSheet, "F64", c.cvcTotal);

      setCell(intSheet, "B65", d.preparedBy);
      setCell(intSheet, "B66", d.approvedByPM);
      setCell(intSheet, "B67", d.checkedByCostControl);
      setCell(intSheet, "B68", d.projectControlsManager);
      setCell(intSheet, "B69", d.commercialContractsManager);
      setCell(intSheet, "B70", d.operationsDirector?.name || "");
      setCell(intSheet, "B71", d.internalAudit?.name || "");
      setCell(intSheet, "B72", d.ceo?.name || "");

      if (d.notes) setCell(intSheet, "B50", d.notes);
    }

    // ─── MainWorks (Appendix A) ───
    const mw = wb.Sheets["MainWorks"];
    if (mw) {
      setCell(mw, "D4", d.certNo);
      setCell(mw, "D5", d.certDate);
      setCell(mw, "D6", d.vendorName);
      setCell(mw, "D8", d.project);

      if (d.appAItems && d.appAItems.length > 0) {
        d.appAItems.forEach((item: any, i: number) => {
          const row = 13 + i;
          setCell(mw, `B${row}`, item.desc || "");
          setCell(mw, `E${row}`, item.contractorTotal || 0);
          setCell(mw, `F${row}`, item.contractorPct || 0);
          setCell(mw, `G${row}`, item.contractorGross || (parseFloat(item.contractorTotal) || 0) * (parseFloat(item.contractorPct) || 0) / 100);
          setCell(mw, `H${row}`, item.arcTotal || 0);
          setCell(mw, `I${row}`, item.arcPct || 0);
          setCell(mw, `J${row}`, item.arcGross || (parseFloat(item.arcTotal) || 0) * (parseFloat(item.arcPct) || 0) / 100);
          setCell(mw, `K${row}`, item.comment || "");
        });
        const totalRow = 13 + d.appAItems.length;
        const arcTotal = d.appAItems.reduce((s: number, r: any) => s + (parseFloat(r.arcTotal) || 0) * (parseFloat(r.arcPct) || 0) / 100, 0);
        setCell(mw, `J${totalRow}`, arcTotal);
      }
    }

    // ─── Variations (Appendix B) ───
    const vari = wb.Sheets["Variations"];
    if (vari) {
      setCell(vari, "D4", d.certNo);
      setCell(vari, "D5", d.certDate);
      setCell(vari, "D6", d.vendorName);
      setCell(vari, "D8", d.project);

      if (d.appBItems && d.appBItems.length > 0) {
        d.appBItems.forEach((item: any, i: number) => {
          const row = 15 + i;
          setCell(vari, `B${row}`, item.voNo || "");
          setCell(vari, `C${row}`, item.desc || "");
          setCell(vari, `E${row}`, item.contractorTotal || 0);
          setCell(vari, `F${row}`, item.contractorPct || 0);
          setCell(vari, `G${row}`, item.contractorGross || (parseFloat(item.contractorTotal) || 0) * (parseFloat(item.contractorPct) || 0) / 100);
          setCell(vari, `H${row}`, item.arcTotal || 0);
          setCell(vari, `I${row}`, item.arcPct || 0);
          setCell(vari, `J${row}`, item.arcGross || (parseFloat(item.arcTotal) || 0) * (parseFloat(item.arcPct) || 0) / 100);
          setCell(vari, `K${row}`, item.comment || "");
        });
      }
    }

    // ─── Contra Charge Set Off (Appendix C) ───
    const contraSheet = wb.Sheets["Contra Charge Set Off"];
    if (contraSheet) {
      setCell(contraSheet, "D4", d.certNo);
      setCell(contraSheet, "D5", d.certDate);
      setCell(contraSheet, "D6", d.vendorName);
      setCell(contraSheet, "D8", d.project);

      if (d.appCItems && d.appCItems.length > 0) {
        d.appCItems.forEach((item: any, i: number) => {
          const row = 15 + i;
          setCell(contraSheet, `B${row}`, item.desc || "");
          setCell(contraSheet, `C${row}`, item.desc || "");
          setCell(contraSheet, `E${row}`, item.totalDeduction || 0);
          setCell(contraSheet, `F${row}`, item.pct || 0);
          setCell(contraSheet, `G${row}`, (parseFloat(item.totalDeduction) || 0) * (parseFloat(item.pct) || 0) / 100);
        });
      }
    }

    // ─── Measurement Sheets (Appendix D) ───
    const ms = wb.Sheets["Measurement Sheets"];
    if (ms) {
      setCell(ms, "D4", d.certNo);
      setCell(ms, "D5", d.certDate);
      setCell(ms, "D6", d.vendorName);
      setCell(ms, "D8", d.project);
      setCell(ms, "D12", d.scOrderNo);

      if (d.appDItems && d.appDItems.length > 0) {
        d.appDItems.forEach((item: any, i: number) => {
          const row = 15 + i;
          setCell(ms, `B${row}`, item.itemNo || "");
          setCell(ms, `C${row}`, item.desc || "");
          setCell(ms, `D${row}`, item.unit || "");
          setCell(ms, `E${row}`, item.qty || 0);
          setCell(ms, `F${row}`, item.rate || 0);
          setCell(ms, `G${row}`, (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0));
          setCell(ms, `H${row}`, item.pp1 || 0);
          setCell(ms, `I${row}`, item.pp2 || 0);
          setCell(ms, `J${row}`, item.wirRef || "");
          setCell(ms, `K${row}`, item.certified || 0);
        });
        const totalRow = 15 + d.appDItems.length;
        const totalCert = d.appDItems.reduce((s: number, r: any) => s + (parseFloat(r.certified) || 0), 0);
        setCell(ms, `K${totalRow}`, totalCert);
      }
    }

    // ─── Sub-Con Account (Appendix E) ───
    const sca = wb.Sheets["Sub-Con Account"];
    if (sca) {
      setCell(sca, "D4", d.certNo);
      setCell(sca, "D5", d.certDate);
      setCell(sca, "D6", d.vendorName);
      setCell(sca, "D8", d.project);

      if (d.appEItems && d.appEItems.length > 0) {
        d.appEItems.forEach((item: any, i: number) => {
          const row = 16 + i;
          setCell(sca, `B${row}`, item.itemNo || "");
          setCell(sca, `C${row}`, item.desc || "");
          setCell(sca, `D${row}`, item.lpoRef || "");
          setCell(sca, `E${row}`, item.ipa1 || "");
          setCell(sca, `F${row}`, item.ipa2 || "");
          setCell(sca, `G${row}`, item.ipa3 || "");
          setCell(sca, `H${row}`, item.ipa4 || "");
          setCell(sca, `I${row}`, item.totalCertified || 0);
        });
      }
    }

    // Write out — keep legacy .xls format to match template
    const outBuffer = XLSX.write(wb, { bookType: "xls", type: "array", cellStyles: true });
    const fileName = `PaymentCert_${d.scOrderNo || "draft"}_IPA${d.certNo || "draft"}.xls`;

    return new NextResponse(outBuffer, {
      headers: {
        "Content-Type": "application/vnd.ms-excel",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Export cert error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
