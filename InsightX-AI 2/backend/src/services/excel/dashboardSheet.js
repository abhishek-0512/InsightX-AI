const {
    titleStyle,
    headerStyle,
    autoFitColumns
} = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Dashboard");

    // ---------- Title ----------
    sheet.mergeCells("A1:D1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "InsightX AI Analytics Dashboard";
    titleStyle(titleCell);
    sheet.getRow(1).height = 28;

    // ---------- Section ----------
    sheet.addRow([]);
    const headerRow = sheet.addRow(["Metric", "Value"]);

    headerStyle(headerRow.getCell(1));
    headerStyle(headerRow.getCell(2));

    const dashboard = analysis.dashboard || {};
    const overview = dashboard.overview || {};
    const revenue = dashboard.revenue || {};
    const performance = dashboard.performance || {};

    const succSales = overview.successfulSales !== undefined ? overview.successfulSales : Math.max(0, (overview.successfulTransactions || 0) - (overview.refundedTransactions || 0));

    const rows = [
        ["Total Transactions", overview.totalTransactions || 0],
        ["Total Successful Transactions (Sales + Refunds)", overview.successfulTransactions || 0],
        ["  • Successful Customer Sales", succSales],
        ["  • Successful Customer Refunds", overview.refundedTransactions || 0],
        ["Failed Transactions", overview.failedTransactions || 0],
        ["Gross Revenue", revenue.totalRevenue || revenue.totalAmount || 0],
        ["Refund Deductions", revenue.refundAmount || 0],
        ["Net Realized Revenue", revenue.netRevenue || revenue.netAmount || 0],
        ["Overall Success Rate (%)", performance.successRate || 0],
        ["Refund Rate (%)", performance.refundRate || 0],
        ["Top Payment Mode", dashboard.topPaymentMode ? dashboard.topPaymentMode[0] : "-"],
        ["Top Device", dashboard.topDevice ? dashboard.topDevice[0] : "-"],
        ["Top Location", dashboard.topLocation ? dashboard.topLocation[0] : "-"],
        ["Peak Month", dashboard.peakMonth ? dashboard.peakMonth[0] : "-"]
    ];

    rows.forEach((row) => {
        const addedRow = sheet.addRow(row);
        const metricName = row[0];

        if (["Gross Revenue", "Refund Deductions", "Net Revenue"].includes(metricName)) {
            addedRow.getCell(2).numFmt = "₹#,##0.00";
        }
    });

    // ---------- Borders ----------
    sheet.eachRow((row) => {
        if (row.hasValues) {
            row.eachCell({ includeEmpty: false }, (cell) => {
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