const {
    applySheetTitle,
    applyTableHeaders,
    applyZebraStriping,
    applyTotalRowStyle,
    currencyStyle,
    numberStyle,
    autoFitColumns
} = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Monthly Breakdown");

    // ---------- Title Banner ----------
    applySheetTitle(
        sheet,
        "Monthly Financial Performance & Comparison Breakdown",
        "Month-by-month reconciliation of revenue, transaction volumes, and verified refund deductions",
        9
    );

    sheet.addRow([]);

    // ---------- Table Headers ----------
    const headers = [
        "Billing Month",
        "Total Volume",
        "Successful Tx",
        "Successful Refunds",
        "Refund Amount (₹)",
        "Gross Revenue (₹)",
        "Net Revenue (₹)",
        "Success Rate (%)",
        "Top Channel"
    ];

    const headerRow = sheet.addRow(headers);
    applyTableHeaders(headerRow, headers);

    const startRow = sheet.lastRow.number + 1;
    const monthlyList = analysis.monthly?.monthlyList || [];

    let totalTx = 0;
    let totalSuccess = 0;
    let totalRefunds = 0;
    let totalGross = 0;
    let totalRefundAmount = 0;
    let totalNet = 0;

    monthlyList.forEach((m) => {
        totalTx += m.transactions;
        totalSuccess += m.successfulTransactions;
        totalRefunds += m.refundedTransactions;
        totalGross += m.grossAmount;
        totalRefundAmount += m.refundAmount;
        totalNet += m.netAmount;

        const row = sheet.addRow([
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

        numberStyle(row.getCell(2));
        numberStyle(row.getCell(3));
        numberStyle(row.getCell(4));
        currencyStyle(row.getCell(5));
        currencyStyle(row.getCell(6));
        currencyStyle(row.getCell(7));
    });

    const endRow = sheet.lastRow.number;
    applyZebraStriping(sheet, startRow, endRow);

    // ---------- Cumulative Total Row ----------
    if (monthlyList.length > 0) {
        const cumulativeSuccessRate = totalTx > 0 ? Number(((totalSuccess / totalTx) * 100).toFixed(2)) : 0;

        const totalRow = sheet.addRow([
            "CUMULATIVE TOTAL",
            totalTx,
            totalSuccess,
            totalRefunds,
            totalRefundAmount,
            totalGross,
            totalNet,
            `${cumulativeSuccessRate}%`,
            "All Channels"
        ]);

        numberStyle(totalRow.getCell(2));
        numberStyle(totalRow.getCell(3));
        numberStyle(totalRow.getCell(4));
        currencyStyle(totalRow.getCell(5));
        currencyStyle(totalRow.getCell(6));
        currencyStyle(totalRow.getCell(7));

        applyTotalRowStyle(totalRow, 9);
    }

    autoFitColumns(sheet);
};
