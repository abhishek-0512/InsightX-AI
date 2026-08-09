const {
    applySheetTitle,
    applySectionHeader,
    applyTableHeaders,
    applyZebraStriping,
    currencyStyle,
    numberStyle,
    autoFitColumns,
    colors
} = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Executive Summary");

    // ---------- Sheet Title Banner ----------
    applySheetTitle(
        sheet,
        "InsightX AI — Executive Business & Revenue Report",
        `Generated: ${new Date().toLocaleString("en-IN")} • Multi-Month Transaction Intelligence`,
        6
    );

    sheet.addRow([]);

    // ================= 1. KEY PERFORMANCE INDICATORS =================
    let currRow = 4;
    applySectionHeader(sheet, currRow, "1. KEY PERFORMANCE INDICATORS (CUMULATIVE)", 6);
    currRow++;

    const kpiHeader = sheet.addRow(["Performance Metric", "Value", "", "Revenue Component", "Amount (₹)", "Status"]);
    applyTableHeaders(kpiHeader, ["Operational Metric", "Volume", "", "Financial Metric", "Amount (₹)", "Status"]);
    currRow++;

    const kpiStartRow = currRow;

    const r1 = sheet.addRow([
        "Total Transactions",
        analysis.payment?.overview?.totalTransactions || 0,
        "",
        "Gross Revenue",
        analysis.payment?.revenue?.totalAmount || 0,
        "Completed"
    ]);

    const r2 = sheet.addRow([
        "Successful Transactions",
        analysis.payment?.overview?.successfulTransactions || 0,
        "",
        "Refund Deductions",
        analysis.payment?.revenue?.refundAmount || 0,
        "Deducted"
    ]);

    const r3 = sheet.addRow([
        "Successful Refunds",
        analysis.payment?.overview?.refundedTransactions || 0,
        "",
        "Net Realized Revenue",
        analysis.payment?.revenue?.netAmount || 0,
        "Settled"
    ]);

    const r4 = sheet.addRow([
        "Success Rate (%)",
        `${analysis.payment?.successRate || 0}%`,
        "",
        "Refund Rate (%)",
        `${analysis.payment?.refundRate || 0}%`,
        "Optimal"
    ]);

    // Apply specific cell styles
    numberStyle(r1.getCell(2));
    currencyStyle(r1.getCell(5));
    numberStyle(r2.getCell(2));
    currencyStyle(r2.getCell(5));
    numberStyle(r3.getCell(2));
    currencyStyle(r3.getCell(5));

    // Highlight Net Revenue
    r3.getCell(5).font = { bold: true, size: 11, color: { argb: colors.success } };

    const kpiEndRow = sheet.lastRow.number;
    applyZebraStriping(sheet, kpiStartRow, kpiEndRow);

    // ================= 2. MONTHLY PERFORMANCE SUMMARY =================
    if (analysis.monthly && analysis.monthly.available) {
        sheet.addRow([]);
        currRow = sheet.lastRow.number + 1;
        applySectionHeader(sheet, currRow, "2. MONTHLY FINANCIAL PERFORMANCE SUMMARY", 6);

        const mHeader = sheet.addRow(["Month", "Total Volume", "Successful Tx", "Gross Revenue", "Net Revenue", "Success Rate"]);
        applyTableHeaders(mHeader, ["Month", "Total Volume", "Successful Tx", "Gross Revenue", "Net Revenue", "Success Rate"]);

        const mStartRow = sheet.lastRow.number + 1;
        const monthlyList = analysis.monthly.monthlyList || [];

        monthlyList.forEach((m) => {
            const mRow = sheet.addRow([
                m.month,
                m.transactions,
                m.successfulTransactions,
                m.grossAmount,
                m.netAmount,
                `${m.successRate}%`
            ]);
            numberStyle(mRow.getCell(2));
            numberStyle(mRow.getCell(3));
            currencyStyle(mRow.getCell(4));
            currencyStyle(mRow.getCell(5));
        });

        applyZebraStriping(sheet, mStartRow, sheet.lastRow.number);
    }

    // ================= 3. TOP PAYMENT CHANNELS =================
    sheet.addRow([]);
    currRow = sheet.lastRow.number + 1;
    applySectionHeader(sheet, currRow, "3. PAYMENT CHANNEL DISTRIBUTION", 6);

    const modeHeader = sheet.addRow(["Payment Channel", "Volume", "Share (%)", "", "", ""]);
    applyTableHeaders(modeHeader, ["Payment Channel", "Volume", "Share (%)", "", "", ""]);

    const pStartRow = sheet.lastRow.number + 1;
    const paymentModes = analysis.payment?.paymentModes || {};
    const totalTx = analysis.payment?.overview?.totalTransactions || 1;

    Object.entries(paymentModes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .forEach(([mode, count]) => {
            const share = Number(((count / totalTx) * 100).toFixed(2));
            const pRow = sheet.addRow([mode, count, `${share}%`, "", "", ""]);
            numberStyle(pRow.getCell(2));
        });

    applyZebraStriping(sheet, pStartRow, sheet.lastRow.number);

    // ================= 4. EXECUTIVE AI INSIGHTS =================
    sheet.addRow([]);
    currRow = sheet.lastRow.number + 1;
    applySectionHeader(sheet, currRow, "4. STRATEGIC EXECUTIVE INSIGHTS", 6);

    const insights = [];
    if (analysis.payment.successRate >= 95)
        insights.push("Excellent transaction conversion observed across payment gateways.");
    else if (analysis.payment.successRate >= 85)
        insights.push("Healthy transaction volume with steady customer settlement rates.");
    else
        insights.push("Stable processing throughput; recommended to monitor high-value transactions.");

    if (analysis.payment.overview.refundedTransactions > 0) {
        insights.push(`Processed ${analysis.payment.overview.refundedTransactions} successful refund(s) totaling ₹${analysis.payment.revenue.refundAmount.toLocaleString()} (${analysis.payment.refundRate}% refund rate). Failed refund attempts excluded.`);
    }

    if (analysis.monthly && analysis.monthly.available && analysis.monthly.peakMonth) {
        insights.push(`Peak revenue period: ${analysis.monthly.peakMonth[0]} generating ₹${analysis.monthly.peakMonth[1].netAmount.toLocaleString()} in net revenue.`);
    }

    const topMode = Object.entries(paymentModes).sort((a, b) => b[1] - a[1])[0];
    if (topMode) {
        insights.push(`Top customer payment channel is "${topMode[0]}" accounting for ${topMode[1]} transaction(s).`);
    }

    const insStartRow = sheet.lastRow.number + 1;
    insights.forEach((text) => {
        const insRow = sheet.addRow([`•  ${text}`, "", "", "", "", ""]);
        insRow.getCell(1).font = { name: "Segoe UI", size: 10, italic: false };
    });

    applyZebraStriping(sheet, insStartRow, sheet.lastRow.number);

    autoFitColumns(sheet);
};