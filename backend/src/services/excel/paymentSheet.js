const {
    applySheetTitle,
    applySectionHeader,
    applyTableHeaders,
    applyZebraStriping,
    applyTotalRowStyle,
    currencyStyle,
    numberStyle,
    autoFitColumns
} = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Payment Analytics");

    // ---------- Sheet Title Banner ----------
    applySheetTitle(
        sheet,
        "Payment Channel & Revenue Distribution Analysis",
        "Detailed performance by payment gateway, settlement method, and revenue share",
        4
    );

    sheet.addRow([]);

    // ---------- 1. Payment Mode Breakdown ----------
    let currRow = 4;
    applySectionHeader(sheet, currRow, "1. PAYMENT MODE VOLUME & SHARE", 4);

    const modeHeader = sheet.addRow(["Payment Channel", "Transaction Volume", "Volume Share (%)", "Status"]);
    applyTableHeaders(modeHeader, ["Payment Channel", "Transaction Volume", "Volume Share (%)", "Status"]);

    const startRow = sheet.lastRow.number + 1;
    const paymentModes = analysis.payment?.paymentModes || {};
    const totalTransactions = analysis.payment?.overview?.totalTransactions || 1;

    let totalModeCount = 0;
    Object.entries(paymentModes).forEach(([mode, count]) => {
        totalModeCount += count;
        const share = Number(((count / totalTransactions) * 100).toFixed(2));
        const row = sheet.addRow([mode, count, `${share}%`, "Active"]);
        numberStyle(row.getCell(2));
    });

    applyZebraStriping(sheet, startRow, sheet.lastRow.number);

    // Total Row
    const modeTotalRow = sheet.addRow(["Total All Channels", totalModeCount, "100.00%", ""]);
    numberStyle(modeTotalRow.getCell(2));
    applyTotalRowStyle(modeTotalRow, 4);

    // ---------- 2. Revenue Summary ----------
    sheet.addRow([]);
    currRow = sheet.lastRow.number + 1;
    applySectionHeader(sheet, currRow, "2. FINANCIAL REVENUE RECONCILIATION", 4);

    const revHeader = sheet.addRow(["Financial Component", "Amount (₹)", "Description", ""]);
    applyTableHeaders(revHeader, ["Financial Component", "Amount (₹)", "Description", ""]);

    const revStartRow = sheet.lastRow.number + 1;

    const r1 = sheet.addRow(["Gross Revenue (Sales)", analysis.payment?.revenue?.totalAmount || 0, "Total settled customer sales", ""]);
    const r2 = sheet.addRow(["Less: Refund Deductions", analysis.payment?.revenue?.refundAmount || 0, "Verified successful customer refunds", ""]);
    const r3 = sheet.addRow(["Net Realized Revenue", analysis.payment?.revenue?.netAmount || 0, "Net settled amount to merchant account", ""]);

    currencyStyle(r1.getCell(2));
    currencyStyle(r2.getCell(2));
    currencyStyle(r3.getCell(2));

    applyZebraStriping(sheet, revStartRow, sheet.lastRow.number);

    // Highlight Net Realized Revenue
    applyTotalRowStyle(r3, 4);

    autoFitColumns(sheet);
};