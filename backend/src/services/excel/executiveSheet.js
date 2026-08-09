const {
    titleStyle,
    headerStyle,
    currencyStyle,
    autoFitColumns
} = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Executive Summary");

    // ---------- Title ----------
    sheet.mergeCells("A1:D1");
    sheet.getCell("A1").value = "InsightX AI Executive Business Report";
    titleStyle(sheet.getCell("A1"));
    sheet.getRow(1).height = 28;

    let row = 3;

    // ================= KPIs =================
    sheet.getCell(`A${row}`).value = "KEY PERFORMANCE INDICATORS (CUMULATIVE)";
    sheet.getCell(`A${row}`).font = { bold: true, size: 13 };
    row++;

    const kpiHeader = sheet.addRow(["Performance Metric", "Value"]);
    headerStyle(kpiHeader.getCell(1));
    headerStyle(kpiHeader.getCell(2));

    sheet.addRow(["Total Transaction Volume", analysis.payment?.overview?.totalTransactions || 0]);
    sheet.addRow(["Successful Transactions", analysis.payment?.overview?.successfulTransactions || 0]);
    sheet.addRow(["Successful Refunds", analysis.payment?.overview?.refundedTransactions || 0]);
    sheet.addRow(["Success Rate", `${analysis.payment?.successRate || 0}%`]);
    sheet.addRow(["Refund Rate", `${analysis.payment?.refundRate || 0}%`]);
    const gRow = sheet.addRow(["Gross Revenue", analysis.payment?.revenue?.totalAmount || 0]);
    const rfRow = sheet.addRow(["Refund Amount Deducted", analysis.payment?.revenue?.refundAmount || 0]);
    const nRow = sheet.addRow(["Net Revenue", analysis.payment?.revenue?.netAmount || 0]);

    currencyStyle(gRow.getCell(2));
    currencyStyle(rfRow.getCell(2));
    currencyStyle(nRow.getCell(2));

    row = sheet.lastRow.number + 2;

    // ================= TOP PAYMENT MODES =================
    sheet.getCell(`A${row}`).value = "TOP PAYMENT CHANNELS";
    sheet.getCell(`A${row}`).font = { bold: true, size: 13 };
    row++;

    const modeHeader = sheet.addRow(["Payment Channel", "Volume"]);
    headerStyle(modeHeader.getCell(1));
    headerStyle(modeHeader.getCell(2));

    Object.entries(analysis.payment.paymentModes || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([mode, count]) => {
            sheet.addRow([mode, count]);
        });

    row = sheet.lastRow.number + 2;

    // ================= MONTHLY PERFORMANCE SUMMARY =================
    if (analysis.monthly && analysis.monthly.available) {
        sheet.getCell(`A${row}`).value = "MONTHLY FINANCIAL PERFORMANCE";
        sheet.getCell(`A${row}`).font = { bold: true, size: 13 };
        row++;

        const mHeader = sheet.addRow(["Month", "Total Volume", "Successful Tx", "Refund Amount", "Gross Revenue", "Net Revenue", "Success Rate"]);
        for (let c = 1; c <= 7; c++) {
            headerStyle(mHeader.getCell(c));
        }

        const monthlyList = analysis.monthly.monthlyList || [];
        monthlyList.forEach((m) => {
            const mRow = sheet.addRow([
                m.month,
                m.transactions,
                m.successfulTransactions,
                m.refundAmount,
                m.grossAmount,
                m.netAmount,
                `${m.successRate}%`
            ]);
            currencyStyle(mRow.getCell(4));
            currencyStyle(mRow.getCell(5));
            currencyStyle(mRow.getCell(6));
        });

        row = sheet.lastRow.number + 2;
    }

    // ================= AI INSIGHTS =================
    sheet.getCell(`A${row}`).value = "EXECUTIVE INSIGHTS";
    sheet.getCell(`A${row}`).font = { bold: true, size: 13 };
    row++;

    const insights = [];

    if (analysis.payment.successRate >= 95)
        insights.push("Excellent payment success rate observed across the business portfolio.");
    else if (analysis.payment.successRate >= 85)
        insights.push("Payment success rate is healthy with strong customer conversion.");
    else
        insights.push("Payment processing is stable; monitor gateway routing for high-value transactions.");

    if (analysis.payment.overview.refundedTransactions > 0) {
        insights.push(`Recorded ${analysis.payment.overview.refundedTransactions} successful refund(s) totaling ₹${analysis.payment.revenue.refundAmount.toLocaleString()} (${analysis.payment.refundRate}% refund rate). Failed refund attempts are excluded.`);
    }

    if (analysis.monthly && analysis.monthly.available && analysis.monthly.peakMonth)
        insights.push(`Peak revenue month: ${analysis.monthly.peakMonth[0]} with ₹${analysis.monthly.peakMonth[1].netAmount.toLocaleString()} net revenue.`);

    const topMode = Object.entries(analysis.payment.paymentModes || {})
        .sort((a, b) => b[1] - a[1])[0];

    if (topMode)
        insights.push(`${topMode[0]} is the primary transaction channel.`);

    insights.forEach((text) => {
        sheet.addRow([`• ${text}`]);
    });

    sheet.eachRow((r, index) => {
        if (index === 1) return;
        r.eachCell((cell) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });
    });

    autoFitColumns(sheet);
};