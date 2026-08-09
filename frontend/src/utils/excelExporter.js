import ExcelJS from "exceljs";

const colors = {
    navyDark: "0F172A",
    navyMedium: "1E293B",
    navyLight: "334155",
    primary: "0284C7",
    success: "059669",
    zebra: "F8FAFC",
    white: "FFFFFF",
    totalRow: "E2E8F0",
    borderLight: "E2E8F0",
    borderMedium: "CBD5E1",
    borderDark: "94A3B8",
    textWhite: "FFFFFF"
};

function applySheetBanner(sheet, title, subtitle = "", colSpan = 8) {
    const endCol = String.fromCharCode(65 + colSpan - 1);
    sheet.mergeCells(`A1:${endCol}1`);
    const titleCell = sheet.getCell("A1");
    titleCell.value = title;
    titleCell.font = { name: "Segoe UI", size: 15, bold: true, color: { argb: colors.textWhite } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navyDark } };
    titleCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    sheet.getRow(1).height = 34;

    if (subtitle) {
        sheet.mergeCells(`A2:${endCol}2`);
        const subCell = sheet.getCell("A2");
        subCell.value = subtitle;
        subCell.font = { name: "Segoe UI", size: 10, italic: true, color: { argb: "94A3B8" } };
        subCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navyMedium } };
        subCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
        sheet.getRow(2).height = 22;
    }
}

function applySectionHeader(sheet, rowNum, title, colSpan = 6) {
    const endCol = String.fromCharCode(65 + colSpan - 1);
    sheet.mergeCells(`A${rowNum}:${endCol}${rowNum}`);
    const cell = sheet.getCell(`A${rowNum}`);
    cell.value = title;
    cell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: colors.textWhite } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.primary } };
    cell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    sheet.getRow(rowNum).height = 24;
}

function applyTableHeaders(row, titles = []) {
    titles.forEach((title, idx) => {
        const cell = row.getCell(idx + 1);
        cell.value = title;
        cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: colors.textWhite } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navyDark } };
        cell.alignment = { horizontal: idx === 0 ? "left" : "right", vertical: "middle" };
        cell.border = {
            top: { style: "medium", color: { argb: colors.navyLight } },
            bottom: { style: "medium", color: { argb: colors.navyLight } },
            left: { style: "thin", color: { argb: colors.navyLight } },
            right: { style: "thin", color: { argb: colors.navyLight } }
        };
    });
    row.height = 26;
}

function applyZebra(sheet, startRow, endRow) {
    for (let r = startRow; r <= endRow; r++) {
        const row = sheet.getRow(r);
        const isEven = (r - startRow) % 2 === 1;
        const bgColor = isEven ? colors.zebra : colors.white;

        row.eachCell({ includeEmpty: false }, (cell) => {
            if (!cell.fill || cell.fill.type !== "pattern") {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
            }
            cell.font = { name: "Segoe UI", size: 10, ...(cell.font || {}) };
            cell.border = {
                top: { style: "thin", color: { argb: colors.borderLight } },
                bottom: { style: "thin", color: { argb: colors.borderLight } },
                left: { style: "thin", color: { argb: colors.borderLight } },
                right: { style: "thin", color: { argb: colors.borderLight } }
            };
        });
        if (!row.height) row.height = 22;
    }
}

function applyTotalStyle(row, colCount = 8) {
    row.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: colors.navyDark } };
    for (let c = 1; c <= colCount; c++) {
        const cell = row.getCell(c);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.totalRow } };
        cell.border = {
            top: { style: "thin", color: { argb: colors.borderDark } },
            bottom: { style: "double", color: { argb: colors.navyDark } },
            left: { style: "thin", color: { argb: colors.borderMedium } },
            right: { style: "thin", color: { argb: colors.borderMedium } }
        };
    }
    row.height = 26;
}

function currencyFormat(cell) {
    cell.numFmt = "₹#,##0.00";
    cell.alignment = { horizontal: "right", vertical: "middle" };
}

function numberFormat(cell) {
    cell.numFmt = "#,##0";
    cell.alignment = { horizontal: "right", vertical: "middle" };
}

function autoFit(worksheet) {
    worksheet.views = [{ showGridLines: true }];
    worksheet.columns.forEach((column) => {
        let max = 14;
        column.eachCell({ includeEmpty: false }, (cell) => {
            const val = cell.value ? String(cell.value) : "";
            if (val.length > max) max = val.length;
        });
        column.width = Math.min(Math.max(max + 4, 16), 45);
    });
}

/**
 * Generates and downloads a beautifully styled Excel report directly in the browser
 */
export async function exportExcelInBrowser(rows, analysis, fileName = "InsightX_Report.xlsx") {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "InsightX AI";
    workbook.created = new Date();

    // ==========================================
    // 1. EXECUTIVE SUMMARY SHEET
    // ==========================================
    const wsExec = workbook.addWorksheet("Executive Summary");
    applySheetBanner(wsExec, "InsightX AI — Executive Business & Revenue Report", `Generated: ${new Date().toLocaleString("en-IN")} • Multi-Month Financial Intelligence`, 6);
    wsExec.addRow([]);

    let curRow = 4;
    applySectionHeader(wsExec, curRow, "1. KEY PERFORMANCE INDICATORS (CUMULATIVE)", 6);
    curRow++;

    const kpiHeader = wsExec.addRow(["Performance Metric", "Value", "", "Financial Metric", "Amount (₹)", "Status"]);
    applyTableHeaders(kpiHeader, ["Operational Metric", "Volume", "", "Financial Metric", "Amount (₹)", "Status"]);
    curRow++;

    const kpiStart = curRow;
    const r1 = wsExec.addRow(["Total Transactions", analysis.payment?.overview?.totalTransactions || 0, "", "Gross Revenue", analysis.payment?.revenue?.totalAmount || 0, "Completed"]);
    const r2 = wsExec.addRow(["Successful Transactions", analysis.payment?.overview?.successfulTransactions || 0, "", "Refund Deductions", analysis.payment?.revenue?.refundAmount || 0, "Deducted"]);
    const r3 = wsExec.addRow(["Successful Refunds", analysis.payment?.overview?.refundedTransactions || 0, "", "Net Realized Revenue", analysis.payment?.revenue?.netAmount || 0, "Settled"]);
    const r4 = wsExec.addRow(["Success Rate (%)", `${analysis.payment?.successRate || 0}%`, "", "Refund Rate (%)", `${analysis.payment?.refundRate || 0}%`, "Optimal"]);

    numberFormat(r1.getCell(2));
    currencyFormat(r1.getCell(5));
    numberFormat(r2.getCell(2));
    currencyFormat(r2.getCell(5));
    numberFormat(r3.getCell(2));
    currencyFormat(r3.getCell(5));
    r3.getCell(5).font = { bold: true, size: 11, color: { argb: colors.success } };

    applyZebra(wsExec, kpiStart, wsExec.lastRow.number);

    // Monthly Table in Executive
    const monthlyList = analysis.monthly?.monthlyList || [];
    if (monthlyList.length > 0) {
        wsExec.addRow([]);
        curRow = wsExec.lastRow.number + 1;
        applySectionHeader(wsExec, curRow, "2. MONTHLY FINANCIAL PERFORMANCE SUMMARY", 6);

        const mHead = wsExec.addRow(["Month", "Total Volume", "Successful Tx", "Gross Revenue", "Net Revenue", "Success Rate"]);
        applyTableHeaders(mHead, ["Month", "Total Volume", "Successful Tx", "Gross Revenue", "Net Revenue", "Success Rate"]);

        const mStart = wsExec.lastRow.number + 1;
        monthlyList.forEach((m) => {
            const mR = wsExec.addRow([m.month, m.transactions, m.successfulTransactions, m.grossAmount, m.netAmount, `${m.successRate}%`]);
            numberFormat(mR.getCell(2));
            numberFormat(mR.getCell(3));
            currencyFormat(mR.getCell(4));
            currencyFormat(mR.getCell(5));
        });
        applyZebra(wsExec, mStart, wsExec.lastRow.number);
    }

    // Payment Modes in Executive
    wsExec.addRow([]);
    curRow = wsExec.lastRow.number + 1;
    applySectionHeader(wsExec, curRow, "3. PAYMENT CHANNEL DISTRIBUTION", 6);
    const pHead = wsExec.addRow(["Payment Channel", "Volume", "Share (%)", "", "", ""]);
    applyTableHeaders(pHead, ["Payment Channel", "Volume", "Share (%)", "", "", ""]);

    const pStart = wsExec.lastRow.number + 1;
    const paymentModes = analysis.payment?.paymentModes || {};
    const totalTx = analysis.payment?.overview?.totalTransactions || 1;
    Object.entries(paymentModes).sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([mode, count]) => {
        const share = Number(((count / totalTx) * 100).toFixed(2));
        const pR = wsExec.addRow([mode, count, `${share}%`, "", "", ""]);
        numberFormat(pR.getCell(2));
    });
    applyZebra(wsExec, pStart, wsExec.lastRow.number);

    // AI Insights
    wsExec.addRow([]);
    curRow = wsExec.lastRow.number + 1;
    applySectionHeader(wsExec, curRow, "4. STRATEGIC EXECUTIVE INSIGHTS", 6);
    const insStart = wsExec.lastRow.number + 1;
    (analysis.aiSummary || []).forEach((ins) => {
        const insR = wsExec.addRow([`•  ${ins}`, "", "", "", "", ""]);
        insR.getCell(1).font = { name: "Segoe UI", size: 10 };
    });
    applyZebra(wsExec, insStart, wsExec.lastRow.number);
    autoFit(wsExec);

    // ==========================================
    // 2. MONTHLY BREAKDOWN SHEET
    // ==========================================
    if (monthlyList.length > 0) {
        const wsMonthly = workbook.addWorksheet("Monthly Breakdown");
        applySheetBanner(wsMonthly, "Monthly Financial Performance & Comparison Breakdown", "Month-by-month reconciliation of revenue, transaction volumes, and verified refund deductions", 9);
        wsMonthly.addRow([]);

        const monthCols = ["Billing Month", "Total Volume", "Successful Tx", "Successful Refunds", "Refund Amount (₹)", "Gross Revenue (₹)", "Net Revenue (₹)", "Success Rate (%)", "Top Channel"];
        const mRowHead = wsMonthly.addRow(monthCols);
        applyTableHeaders(mRowHead, monthCols);

        const mDataStart = wsMonthly.lastRow.number + 1;
        let totTx = 0, totSuc = 0, totRef = 0, totGross = 0, totRefAmt = 0, totNet = 0;

        monthlyList.forEach((m) => {
            totTx += m.transactions;
            totSuc += m.successfulTransactions;
            totRef += m.refundedTransactions;
            totGross += m.grossAmount;
            totRefAmt += m.refundAmount;
            totNet += m.netAmount;

            const row = wsMonthly.addRow([
                m.month,
                m.transactions,
                m.successfulTransactions,
                m.refundedTransactions,
                m.refundAmount,
                m.grossAmount,
                m.netAmount,
                `${m.successRate}%`,
                m.topPaymentMode || "-"
            ]);
            numberFormat(row.getCell(2));
            numberFormat(row.getCell(3));
            numberFormat(row.getCell(4));
            currencyFormat(row.getCell(5));
            currencyFormat(row.getCell(6));
            currencyFormat(row.getCell(7));
        });

        applyZebra(wsMonthly, mDataStart, wsMonthly.lastRow.number);

        const cumSuccessRate = totTx > 0 ? Number(((totSuc / totTx) * 100).toFixed(2)) : 0;
        const totalRow = wsMonthly.addRow(["CUMULATIVE TOTAL", totTx, totSuc, totRef, totRefAmt, totGross, totNet, `${cumSuccessRate}%`, "All Channels"]);
        numberFormat(totalRow.getCell(2));
        numberFormat(totalRow.getCell(3));
        numberFormat(totalRow.getCell(4));
        currencyFormat(totalRow.getCell(5));
        currencyFormat(totalRow.getCell(6));
        currencyFormat(totalRow.getCell(7));
        applyTotalStyle(totalRow, 9);
        autoFit(wsMonthly);
    }

    // ==========================================
    // 3. PAYMENT ANALYTICS SHEET
    // ==========================================
    const wsPay = workbook.addWorksheet("Payment Analytics");
    applySheetBanner(wsPay, "Payment Channel & Revenue Distribution Analysis", "Detailed performance by payment gateway, settlement method, and revenue share", 4);
    wsPay.addRow([]);

    applySectionHeader(wsPay, 4, "1. PAYMENT MODE VOLUME & SHARE", 4);
    const payHead = wsPay.addRow(["Payment Channel", "Transaction Volume", "Volume Share (%)", "Status"]);
    applyTableHeaders(payHead, ["Payment Channel", "Transaction Volume", "Volume Share (%)", "Status"]);

    const payStart = wsPay.lastRow.number + 1;
    let totModeCount = 0;
    Object.entries(paymentModes).forEach(([mode, count]) => {
        totModeCount += count;
        const share = Number(((count / totalTx) * 100).toFixed(2));
        const row = wsPay.addRow([mode, count, `${share}%`, "Active"]);
        numberFormat(row.getCell(2));
    });
    applyZebra(wsPay, payStart, wsPay.lastRow.number);

    const modeTotal = wsPay.addRow(["Total All Channels", totModeCount, "100.00%", ""]);
    numberFormat(modeTotal.getCell(2));
    applyTotalStyle(modeTotal, 4);

    wsPay.addRow([]);
    const revRow = wsPay.lastRow.number + 1;
    applySectionHeader(wsPay, revRow, "2. FINANCIAL REVENUE RECONCILIATION", 4);

    const revHead = wsPay.addRow(["Financial Component", "Amount (₹)", "Description", ""]);
    applyTableHeaders(revHead, ["Financial Component", "Amount (₹)", "Description", ""]);

    const revStart = wsPay.lastRow.number + 1;
    const rev1 = wsPay.addRow(["Gross Revenue (Sales)", analysis.payment?.revenue?.totalAmount || 0, "Total settled customer sales", ""]);
    const rev2 = wsPay.addRow(["Less: Refund Deductions", analysis.payment?.revenue?.refundAmount || 0, "Verified successful customer refunds", ""]);
    const rev3 = wsPay.addRow(["Net Realized Revenue", analysis.payment?.revenue?.netAmount || 0, "Net settled amount to merchant account", ""]);

    currencyFormat(rev1.getCell(2));
    currencyFormat(rev2.getCell(2));
    currencyFormat(rev3.getCell(2));
    applyZebra(wsPay, revStart, wsPay.lastRow.number);
    applyTotalStyle(rev3, 4);
    autoFit(wsPay);

    // ==========================================
    // 4. RAW DATA SHEET
    // ==========================================
    if (rows && rows.length > 0) {
        const wsRaw = workbook.addWorksheet("Raw Data");
        const headers = Object.keys(rows[0]);
        const rHead = wsRaw.addRow(headers);
        applyTableHeaders(rHead, headers);

        const rStart = wsRaw.lastRow.number + 1;
        rows.slice(0, 5000).forEach((r) => {
            const vals = headers.map((h) => r[h] !== undefined ? r[h] : "");
            wsRaw.addRow(vals);
        });
        applyZebra(wsRaw, rStart, wsRaw.lastRow.number);
        autoFit(wsRaw);
    }

    // Write to browser buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

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
