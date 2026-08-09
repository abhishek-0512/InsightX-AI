const {
    applySheetTitle,
    applySectionHeader,
    applyTableHeaders,
    applyZebraStriping,
    currencyStyle,
    numberStyle,
    autoFitColumns
} = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Dashboard");

    // ---------- Title Banner ----------
    applySheetTitle(
        sheet,
        "InsightX AI — Business & Financial Dashboard",
        "High-level operational and financial summary metrics",
        4
    );

    sheet.addRow([]);

    // ---------- Section 1: Financial Performance ----------
    let currRow = 4;
    applySectionHeader(sheet, currRow, "1. FINANCIAL METRICS", 4);

    const fHeader = sheet.addRow(["Financial Metric", "Value (₹)", "Category", ""]);
    applyTableHeaders(fHeader, ["Financial Metric", "Value (₹)", "Category", ""]);

    const fStart = sheet.lastRow.number + 1;
    const revenue = analysis.dashboard?.revenue || analysis.payment?.revenue || {};

    const r1 = sheet.addRow(["Gross Revenue", revenue.totalRevenue || revenue.totalAmount || 0, "Gross Settlement", ""]);
    const r2 = sheet.addRow(["Refund Deductions", revenue.refundAmount || 0, "Successful Refunds", ""]);
    const r3 = sheet.addRow(["Net Realized Revenue", revenue.netRevenue || revenue.netAmount || 0, "Net Settled Revenue", ""]);

    currencyStyle(r1.getCell(2));
    currencyStyle(r2.getCell(2));
    currencyStyle(r3.getCell(2));

    applyZebraStriping(sheet, fStart, sheet.lastRow.number);

    // ---------- Section 2: Transaction Volume & Operations ----------
    sheet.addRow([]);
    currRow = sheet.lastRow.number + 1;
    applySectionHeader(sheet, currRow, "2. OPERATIONAL VOLUME & SUCCESS", 4);

    const oHeader = sheet.addRow(["Operational Metric", "Volume / Rate", "Benchmark", ""]);
    applyTableHeaders(oHeader, ["Operational Metric", "Volume / Rate", "Benchmark", ""]);

    const oStart = sheet.lastRow.number + 1;
    const overview = analysis.dashboard?.overview || analysis.payment?.overview || {};
    const performance = analysis.dashboard?.performance || analysis.payment || {};

    const o1 = sheet.addRow(["Total Transactions", overview.totalTransactions || 0, "100%", ""]);
    const o2 = sheet.addRow(["Successful Transactions", overview.successfulTransactions || 0, "Completed", ""]);
    const o3 = sheet.addRow(["Successful Refunds", overview.refundedTransactions || 0, "Settled Refunds", ""]);
    const o4 = sheet.addRow(["Overall Success Rate", `${performance.successRate || 0}%`, "Optimal Target > 85%", ""]);
    const o5 = sheet.addRow(["Refund Rate", `${performance.refundRate || 0}%`, "Target < 5%", ""]);

    numberStyle(o1.getCell(2));
    numberStyle(o2.getCell(2));
    numberStyle(o3.getCell(2));

    applyZebraStriping(sheet, oStart, sheet.lastRow.number);

    // ---------- Section 3: Key Business Highlights ----------
    sheet.addRow([]);
    currRow = sheet.lastRow.number + 1;
    applySectionHeader(sheet, currRow, "3. KEY BUSINESS HIGHLIGHTS", 4);

    const hHeader = sheet.addRow(["Category", "Top Performing Value", "Notes", ""]);
    applyTableHeaders(hHeader, ["Category", "Top Performing Value", "Notes", ""]);

    const hStart = sheet.lastRow.number + 1;
    const dashboard = analysis.dashboard || {};

    sheet.addRow(["Top Payment Channel", dashboard.topPaymentMode ? `${dashboard.topPaymentMode[0]} (${dashboard.topPaymentMode[1]} tx)` : "-", "Primary customer choice", ""]);
    sheet.addRow(["Top Platform / OS", dashboard.topDevice ? dashboard.topDevice[0] : "-", "Leading client platform", ""]);
    sheet.addRow(["Peak Revenue Month", dashboard.peakMonth ? dashboard.peakMonth[0] : "-", "Highest volume billing period", ""]);

    applyZebraStriping(sheet, hStart, sheet.lastRow.number);

    autoFitColumns(sheet);
};