import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

interface AppendixDRow {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface AppendixERow {
  certNo: string;
  period: string;
  grossAmount: number;
  retentionPct: number;
  netAmount: number;
  cumulativeTotal: number;
}

interface ApprovalRow {
  role: string;
  name: string;
  status: string;
  date: string;
}

interface GenerateXlsRequest {
  // Certificate sheet data
  certNo?: string;
  vendorName?: string;
  vendorType?: string;
  projectName?: string;
  contractValue?: string;
  scOrderNo?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  periodFrom?: string;
  periodTo?: string;
  previousPayment?: string;
  currentPayment?: string;
  retention?: string;
  vatAmount?: string;
  totalPaymentDue?: string;
  notes?: string;
  trnNumber?: string;
  // Appendix rows
  appendixDRows?: AppendixDRow[];
  appendixERows?: AppendixERow[];
  // Approvals
  approvals?: ApprovalRow[];
}

function headerStyle(): Partial<ExcelJS.Style> {
  return {
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A1A2E" },
    },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    border: {
      top: { style: "thin", color: { argb: "FFD4A017" } },
      left: { style: "thin", color: { argb: "FFD4A017" } },
      bottom: { style: "thin", color: { argb: "FFD4A017" } },
      right: { style: "thin", color: { argb: "FFD4A017" } },
    },
  };
}

function cellStyle(): Partial<ExcelJS.Style> {
  return {
    font: { size: 10 },
    border: {
      top: { style: "thin", color: { argb: "FFE5E7EB" } },
      left: { style: "thin", color: { argb: "FFE5E7EB" } },
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      right: { style: "thin", color: { argb: "FFE5E7EB" } },
    },
  };
}

function labelStyle(): Partial<ExcelJS.Style> {
  return {
    font: { bold: true, size: 10 },
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF3F4F6" },
    },
    border: {
      top: { style: "thin", color: { argb: "FFE5E7EB" } },
      left: { style: "thin", color: { argb: "FFE5E7EB" } },
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      right: { style: "thin", color: { argb: "FFE5E7EB" } },
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateXlsRequest = await req.json();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ARC Command Centre";
    workbook.lastModifiedBy = "ARC Dashboard";
    workbook.created = new Date();
    workbook.modified = new Date();

    // ─── Sheet 1: Certificate ────────────────────────────────────────────────
    const certSheet = workbook.addWorksheet("Certificate", {
      properties: { tabColor: { argb: "FFD4A017" } },
    });
    certSheet.columns = [
      { key: "label", width: 30 },
      { key: "value", width: 45 },
    ];

    // Title
    certSheet.mergeCells("A1:B1");
    const titleCell = certSheet.getCell("A1");
    titleCell.value =
      "Al Ryum Contracting & General Transport LLC — Payment Certificate";
    titleCell.style = {
      font: { bold: true, size: 14, color: { argb: "FFD4A017" } },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F0F1A" } },
    };
    certSheet.getRow(1).height = 30;

    const certFields: Array<[string, string | undefined]> = [
      ["Certificate No", body.certNo],
      ["Vendor / Supplier Name", body.vendorName],
      ["Vendor Type", body.vendorType],
      ["Project Name", body.projectName],
      ["Contract / PO Value (AED)", body.contractValue],
      ["SC/PO Order No", body.scOrderNo],
      ["Invoice No", body.invoiceNo],
      ["Invoice Date", body.invoiceDate],
      ["Period From", body.periodFrom],
      ["Period To", body.periodTo],
      ["TRN Number", body.trnNumber],
      ["", ""],
      ["Previous Payment (AED)", body.previousPayment],
      ["Current Payment (AED)", body.currentPayment],
      ["Retention (AED)", body.retention],
      ["VAT Amount (AED)", body.vatAmount],
      ["TOTAL PAYMENT DUE (AED)", body.totalPaymentDue],
      ["", ""],
      ["Notes", body.notes],
    ];

    certFields.forEach(([label, value], i) => {
      const rowNum = i + 2;
      const row = certSheet.getRow(rowNum);
      row.getCell(1).value = label;
      row.getCell(2).value = value || "—";
      row.getCell(1).style = labelStyle();
      row.getCell(2).style = cellStyle();
      if (label === "TOTAL PAYMENT DUE (AED)") {
        row.getCell(2).style = {
          ...cellStyle(),
          font: { bold: true, size: 12, color: { argb: "FFD4A017" } },
        };
      }
    });

    // ─── Sheet 2: Appendix D ────────────────────────────────────────────────
    const dSheet = workbook.addWorksheet("Appendix D", {
      properties: { tabColor: { argb: "FF2563EB" } },
    });
    dSheet.columns = [
      { header: "Item No", key: "itemNo", width: 10 },
      { header: "Description", key: "description", width: 40 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Quantity", key: "quantity", width: 14 },
      { header: "Rate (AED)", key: "rate", width: 16 },
      { header: "Amount (AED)", key: "amount", width: 18 },
    ];

    // Style header row
    const dHeader = dSheet.getRow(1);
    dHeader.height = 22;
    dHeader.eachCell((cell) => {
      cell.style = headerStyle();
    });

    const dRows: AppendixDRow[] = body.appendixDRows || [];
    let dTotal = 0;
    dRows.forEach((row, i) => {
      const r = dSheet.addRow(row);
      dTotal += row.amount || 0;
      r.eachCell((cell) => {
        cell.style = cellStyle();
        if (i % 2 === 0) {
          cell.style = {
            ...cellStyle(),
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFAFAFA" } },
          };
        }
      });
    });

    // Total row
    const dTotalRow = dSheet.addRow([
      "",
      "TOTAL",
      "",
      "",
      "",
      dTotal,
    ]);
    dTotalRow.eachCell((cell) => {
      cell.style = {
        font: { bold: true, size: 11 },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF3CD" } },
        border: {
          top: { style: "medium", color: { argb: "FFD4A017" } },
          bottom: { style: "medium", color: { argb: "FFD4A017" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        },
      };
    });

    // ─── Sheet 3: Appendix E ────────────────────────────────────────────────
    const eSheet = workbook.addWorksheet("Appendix E", {
      properties: { tabColor: { argb: "FF059669" } },
    });
    eSheet.columns = [
      { header: "Cert No", key: "certNo", width: 12 },
      { header: "Period", key: "period", width: 20 },
      { header: "Gross Amount (AED)", key: "grossAmount", width: 22 },
      { header: "Retention (%)", key: "retentionPct", width: 16 },
      { header: "Net Amount (AED)", key: "netAmount", width: 20 },
      { header: "Cumulative Total (AED)", key: "cumulativeTotal", width: 24 },
    ];

    const eHeader = eSheet.getRow(1);
    eHeader.height = 22;
    eHeader.eachCell((cell) => {
      cell.style = headerStyle();
    });

    const eRows: AppendixERow[] = body.appendixERows || [];
    eRows.forEach((row, i) => {
      const r = eSheet.addRow(row);
      r.eachCell((cell) => {
        cell.style = cellStyle();
        if (i % 2 === 0) {
          cell.style = {
            ...cellStyle(),
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0FDF4" } },
          };
        }
      });
    });

    // ─── Sheet 4: Approvals ────────────────────────────────────────────────
    const apprSheet = workbook.addWorksheet("Approvals", {
      properties: { tabColor: { argb: "FF7C3AED" } },
    });
    apprSheet.columns = [
      { header: "Role", key: "role", width: 28 },
      { header: "Name", key: "name", width: 30 },
      { header: "Signature", key: "signature", width: 30 },
      { header: "Date", key: "date", width: 18 },
      { header: "Status", key: "status", width: 16 },
    ];

    const apprHeader = apprSheet.getRow(1);
    apprHeader.height = 22;
    apprHeader.eachCell((cell) => {
      cell.style = headerStyle();
    });

    const approvals: ApprovalRow[] = body.approvals || [
      { role: "Prepared By", name: "", status: "Pending", date: "" },
      { role: "Checked By", name: "", status: "Pending", date: "" },
      { role: "Approved By", name: "", status: "Pending", date: "" },
    ];

    approvals.forEach((appr, i) => {
      const r = apprSheet.addRow({
        role: appr.role,
        name: appr.name,
        signature: "___________________________",
        date: appr.date || "_______________",
        status: appr.status,
      });
      r.height = 40;
      r.eachCell((cell) => {
        cell.style = cellStyle();
        cell.style.alignment = { vertical: "middle", horizontal: "center" };
        if (i % 2 === 0) {
          cell.style.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF5F3FF" },
          };
        }
        if (cell.value === "Approved") {
          cell.style.font = { bold: true, color: { argb: "FF059669" } };
        }
      });
    });

    // Write to buffer and return
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `ARC_PaymentCert_${body.certNo || "draft"}_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `XLS generation failed: ${message}` },
      { status: 500 }
    );
  }
}
