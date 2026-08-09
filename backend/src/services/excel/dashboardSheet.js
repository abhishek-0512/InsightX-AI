const {
    titleStyle,
    headerStyle,
    currencyStyle,
    autoFitColumns
} = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Dashboard");

    // ---------- Title ----------
    sheet.mergeCells("A1:D1");
    sheet.getCell("A1").value = "InsightX AI Analytics Dashboard";
    titleStyle(sheet.getCell("A1"));
    sheet.getRow(1).height = 28;

    // ---------- Section ----------
    sheet.addRow([]);
    const hRow = sheet.addRow(["Business Metric", "Value"]);
    headerStyle(hRow.getCell(1));
    headerStyle(hRow.getCell(2));

    const dashboard = analysis.dashboard || {};
    const overview = dashboard.overview || {};
    const revenue = dashboard.revenue || {};
    const performance = dashboard.performance || {};

    const rows = [
        ["Total Volume (Transactions)", overview.totalTransactions || 0],
        ["Successful Transactions", overview.successfulTransactions || 0],
        ["Successful Refunds", overview.refundedTransactions || 0],
        ["Gross Revenue", revenue.totalRevenue || 0],
        ["Refund Amount (Deducted)", revenue.refundAmount || 0],
        ["Net Revenue", revenue.netRevenue || 0],
        ["Success Rate (%)", `${performance.successRate || 0}%`],
        ["Refund Rate (%)", `${performance.refundRate || 0}%`],
        ["Top Payment Channel", dashboard.topPaymentMode ? `${dashboard.topPaymentMode[0]} (${dashboard.topPaymentMode[1]} tx)` : "-"],
        ["Top Platform / Device", dashboard.topDevice ? dashboard.topDevice[0] : "-"],
        ["Peak Revenue Month", dashboard.peakMonth ? dashboard.peakMonth[0] : "-"]
    ];

    rows.forEach((r) => {
        const addedRow = sheet.addRow(r);
        // Format currency for Gross, Refund Amount, Net Revenue
        if (r[0] === "Gross Revenue" || r[0] === "Refund Amount (Deducted)" || r[0] === "Net Revenue") {
            currencyStyle(addedRow.getCell(2));
        }
    });

    // ---------- Borders ----------
    sheet.eachRow((r, idx) => {
        if (idx > 1) {
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