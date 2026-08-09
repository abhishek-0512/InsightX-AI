import ExcelJS from "exceljs";

const colors = {
    primary: "2563EB",
    secondary: "1E293B",
    success: "16A34A",
    danger: "DC2626",
    warning: "F59E0B",
    info: "0891B2",
    light: "F8FAFC",
    border: "CBD5E1"
};

const titleStyle = (cell) => {
    cell.font = { name: "Calibri", size: 18, bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.primary } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
};

const headerStyle = (cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.secondary } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
    };
};

const autoFitColumns = (worksheet) => {
    worksheet.columns.forEach((column) => {
        let max = 15;
        column.eachCell({ includeEmpty: true }, (cell) => {
            const len = cell.value ? cell.value.toString().length : 10;
            if (len > max) max = len;
        });
        column.width = Math.min(max + 3, 40);
    });
};

/**
 * Generates and downloads the Excel report in the original PayVista / Jupiter format
 */
export async function exportExcelInBrowser(rows, analysis, fileName = "InsightX_Report.xlsx") {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "InsightX AI";
    workbook.created = new Date();

    // ====================================================
    // 1. Executive Summary
    // ====================================================
    const sheet = workbook.addWorksheet("Executive Summary");

    sheet.columns = [
        { width: 35 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 25 },
        { width: 25 },
        { width: 25 }
    ];

    sheet.mergeCells("A1:K1");
    const mainTitle = sheet.getCell("A1");
    mainTitle.value = "INSIGHTX — TRANSACTION & FINANCIAL REPORT";
    titleStyle(mainTitle);
    sheet.getRow(1).height = 30;

    sheet.mergeCells("A2:K2");
    const subTitle1 = sheet.getCell("A2");
    subTitle1.value = `Generated: ${new Date().toLocaleDateString("en-IN")} | Confidential Report`;
    subTitle1.font = { italic: true, color: { argb: "1E293B" } };
    subTitle1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };

    sheet.mergeCells("A3:K3");
    const subTitle2 = sheet.getCell("A3");
    subTitle2.value = `Total Records: ${analysis.payment?.overview?.totalTransactions || 0}`;
    subTitle2.font = { italic: true, color: { argb: "1E293B" } };
    subTitle2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };

    let row = 5;

    // Overall Performance Summary
    sheet.mergeCells(`A${row}:K${row}`);
    const summaryTitle = sheet.getCell(`A${row}`);
    summaryTitle.value = "OVERALL PERFORMANCE SUMMARY";
    headerStyle(summaryTitle);
    summaryTitle.alignment = { horizontal: "left", vertical: "middle" };
    row++;

    const months = analysis.monthly?.monthlyList ? analysis.monthly.monthlyList.map((m) => m.month) : [];
    const m1 = months[0] || "Month 1";
    const m2 = months[1] || "Month 2";
    const m3 = months[2] || "Month 3";

    const perfHeaders = sheet.addRow(["Metric", "Total", m1, m2, m3, `${m1}-${m2} Growth`, `${m2}-${m3} Growth`, "Trend"]);
    perfHeaders.eachCell((cell) => headerStyle(cell));

    const ov = analysis.payment?.overview || {};
    const rev = analysis.payment?.revenue || {};
    const monthlyMap = analysis.monthly?.monthly || {};

    const getM = (m, key) => (monthlyMap[m] ? monthlyMap[m][key] || 0 : "-");

    const perfRows = [
        ["Total Transactions", ov.totalTransactions || 0, getM(m1, "transactions"), getM(m2, "transactions"), getM(m3, "transactions"), "-", "-", "Steady"],
        ["Total GMV (₹ Lakhs)", Number(((rev.totalAmount || 0) / 100000).toFixed(2)), getM(m1, "grossAmount") ? Number((getM(m1, "grossAmount") / 100000).toFixed(2)) : "-", getM(m2, "grossAmount") ? Number((getM(m2, "grossAmount") / 100000).toFixed(2)) : "-", getM(m3, "grossAmount") ? Number((getM(m3, "grossAmount") / 100000).toFixed(2)) : "-", "-", "-", "Steady"],
        ["Average Transaction (₹)", Number(((rev.totalAmount || 0) / (ov.totalTransactions || 1)).toFixed(2)), "-", "-", "-", "-", "-", "Stable"],
        ["Success Rate (%)", `${analysis.payment?.successRate || 0}%`, "-", "-", "-", "-", "-", "Stable"],
        ["Successful Transactions", ov.successfulTransactions || 0, getM(m1, "successfulTransactions"), getM(m2, "successfulTransactions"), getM(m3, "successfulTransactions"), "-", "-", "Growing"],
        ["Failed Transactions", ov.failedTransactions || 0, getM(m1, "failedTransactions"), getM(m2, "failedTransactions"), getM(m3, "failedTransactions"), "-", "-", "Stable"],
        ["Successful Refunds", ov.refundedTransactions || 0, getM(m1, "refundedTransactions"), getM(m2, "refundedTransactions"), getM(m3, "refundedTransactions"), "-", "-", "Optimal"]
    ];

    perfRows.forEach((r) => sheet.addRow(r));
    row = sheet.lastRow.number + 3;

    // Month-Wise Analysis
    sheet.mergeCells(`A${row}:K${row}`);
    const monthTitle = sheet.getCell(`A${row}`);
    monthTitle.value = "MONTH-WISE ANALYSIS";
    headerStyle(monthTitle);
    monthTitle.alignment = { horizontal: "left", vertical: "middle" };
    row++;

    const monthHeaders = sheet.addRow(["Month", "Transactions", "GMV (₹ Lakhs)", "Avg Txn (₹)", "Successful", "Failed", "Successful Refunds", "Success Rate", "Net Revenue (₹)", "Top Channel"]);
    monthHeaders.eachCell((cell) => headerStyle(cell));

    (analysis.monthly?.monthlyList || []).forEach((m) => {
        sheet.addRow([
            m.month,
            m.transactions || 0,
            Number(((m.grossAmount || 0) / 100000).toFixed(2)),
            Number(((m.grossAmount || 0) / (m.transactions || 1)).toFixed(2)),
            m.successfulTransactions || 0,
            m.failedTransactions || 0,
            m.refundedTransactions || 0,
            `${m.successRate || 0}%`,
            m.netAmount || 0,
            m.topPaymentMode || "-"
        ]);
    });

    row = sheet.lastRow.number + 3;

    // Month-On-Month Growth
    if (months.length > 1) {
        sheet.mergeCells(`A${row}:D${row}`);
        const growthTitle = sheet.getCell(`A${row}`);
        growthTitle.value = "MONTH-ON-MONTH GROWTH";
        headerStyle(growthTitle);
        growthTitle.alignment = { horizontal: "left", vertical: "middle" };
        row++;

        const growthHeaders = sheet.addRow(["Period", "Txn Growth", "GMV Growth", "Success Rate Δ"]);
        for (let i = 1; i <= 4; i++) {
            headerStyle(growthHeaders.getCell(i));
        }

        for (let i = 0; i < months.length - 1; i++) {
            const curM = monthlyMap[months[i]] || {};
            const nextM = monthlyMap[months[i + 1]] || {};
            const txnGrowth = curM.transactions ? (((nextM.transactions - curM.transactions) / curM.transactions) * 100).toFixed(1) + "%" : "-";
            const gmvGrowth = curM.grossAmount ? (((nextM.grossAmount - curM.grossAmount) / curM.grossAmount) * 100).toFixed(1) + "%" : "-";
            const rateDiff = (nextM.successRate - curM.successRate).toFixed(1) + "%";
            sheet.addRow([`${months[i]} - ${months[i + 1]}`, txnGrowth, gmvGrowth, rateDiff]);
        }
    }

    // Borders
    sheet.eachRow((r, rowNumber) => {
        if (rowNumber > 3 && r.hasValues) {
            r.eachCell({ includeEmpty: false }, (cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            });
        }
    });

    sheet.getColumn(4).numFmt = "₹#,##0.00";
    sheet.getColumn(9).numFmt = "₹#,##0.00";

    // ====================================================
    // 2. Dashboard Sheet
    // ====================================================
    const dashSheet = workbook.addWorksheet("Dashboard");
    dashSheet.mergeCells("A1:D1");
    const dTitle = dashSheet.getCell("A1");
    dTitle.value = "InsightX AI Analytics Dashboard";
    titleStyle(dTitle);
    dashSheet.getRow(1).height = 28;

    dashSheet.addRow([]);
    const dHeaderRow = dashSheet.addRow(["Metric", "Value"]);
    headerStyle(dHeaderRow.getCell(1));
    headerStyle(dHeaderRow.getCell(2));

    const dRows = [
        ["Total Transactions", ov.totalTransactions || 0],
        ["Successful Transactions", ov.successfulTransactions || 0],
        ["Failed Transactions", ov.failedTransactions || 0],
        ["Successful Refunds", ov.refundedTransactions || 0],
        ["Gross Revenue", rev.totalAmount || 0],
        ["Refund Deductions", rev.refundAmount || 0],
        ["Net Revenue", rev.netAmount || 0],
        ["Success Rate (%)", analysis.payment?.successRate || 0],
        ["Refund Rate (%)", analysis.payment?.refundRate || 0],
        ["Top Payment Mode", Object.entries(analysis.payment?.paymentModes || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"]
    ];

    dRows.forEach((r) => {
        const added = dashSheet.addRow(r);
        if (["Gross Revenue", "Refund Deductions", "Net Revenue"].includes(r[0])) {
            added.getCell(2).numFmt = "₹#,##0.00";
        }
    });

    dashSheet.eachRow((r) => {
        if (r.hasValues) {
            r.eachCell({ includeEmpty: false }, (cell) => {
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
        }
    });
    autoFitColumns(dashSheet);

    // ====================================================
    // 3. Payment Analytics Sheet
    // ====================================================
    const paySheet = workbook.addWorksheet("Payment Analytics");
    paySheet.mergeCells("A1:C1");
    const pTitle = paySheet.getCell("A1");
    pTitle.value = "Payment Analytics";
    titleStyle(pTitle);

    paySheet.addRow([]);
    const pHeadRow = paySheet.addRow(["Payment Mode", "Transactions"]);
    headerStyle(pHeadRow.getCell(1));
    headerStyle(pHeadRow.getCell(2));

    Object.entries(analysis.payment?.paymentModes || {}).forEach(([mode, count]) => {
        paySheet.addRow([mode, count]);
    });

    let pRowNum = paySheet.lastRow.number + 2;
    const revHeaderCell = paySheet.getCell(`A${pRowNum}`);
    revHeaderCell.value = "Revenue Summary";
    headerStyle(revHeaderCell);

    const rTot = paySheet.addRow(["Gross Revenue", rev.totalAmount || 0]);
    const rRef = paySheet.addRow(["Refund Deductions", rev.refundAmount || 0]);
    const rNet = paySheet.addRow(["Net Revenue", rev.netAmount || 0]);
    rTot.getCell(2).numFmt = "₹#,##0.00";
    rRef.getCell(2).numFmt = "₹#,##0.00";
    rNet.getCell(2).numFmt = "₹#,##0.00";

    paySheet.eachRow((r) => {
        if (r.hasValues) {
            r.eachCell({ includeEmpty: false }, (cell) => {
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
        }
    });
    autoFitColumns(paySheet);

    // ====================================================
    // 4. Raw Data Sheet
    // ====================================================
    if (rows && rows.length > 0) {
        const rawSheet = workbook.addWorksheet("Raw Data");
        const headers = Object.keys(rows[0]);
        rawSheet.columns = headers.map((h) => ({ header: h, key: h, width: 22 }));
        rawSheet.getRow(1).font = { bold: true, size: 12 };
        rawSheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
        rows.forEach((r) => rawSheet.addRow(r));
    }

    // Trigger browser download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const cleanFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = cleanFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
