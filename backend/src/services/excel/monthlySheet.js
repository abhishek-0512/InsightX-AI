const {
    titleStyle,
    headerStyle,
    currencyStyle,
    autoFitColumns
} = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Monthly Breakdown");

    // ---------- Title ----------
    sheet.mergeCells("A1:H1");
    sheet.getCell("A1").value = "Monthly Financial & Revenue Breakdown";
    titleStyle(sheet.getCell("A1"));
    sheet.getRow(1).height = 28;

    sheet.addRow([]);

    // ---------- Headers ----------
    const headers = [
        "Month",
        "Total Tx",
        "Successful Tx",
        "Successful Refunds",
        "Refund Amount",
        "Gross Revenue",
        "Net Revenue",
        "Success Rate (%)"
    ];

    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" } // slate-900
    };
    headerRow.height = 24;

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
            `${m.successRate}%`
        ]);

        currencyStyle(row.getCell(5));
        currencyStyle(row.getCell(6));
        currencyStyle(row.getCell(7));
    });

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
            `${cumulativeSuccessRate}%`
        ]);

        totalRow.font = { bold: true };
        totalRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE2E8F0" } // slate-200
        };

        currencyStyle(totalRow.getCell(5));
        currencyStyle(totalRow.getCell(6));
        currencyStyle(totalRow.getCell(7));
    }

    // ---------- Borders ----------
    sheet.eachRow((r, rowIdx) => {
        if (rowIdx > 2) {
            r.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            });
        }
    });

    autoFitColumns(sheet);
};
