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

    sheet.addRow(["Metric", "Value"]);

    headerStyle(sheet.getCell("A3"));
    headerStyle(sheet.getCell("B3"));

    const dashboard = analysis.dashboard || {};
    const overview = dashboard.overview || {};
    const revenue = dashboard.revenue || {};
    const performance = dashboard.performance || {};

    const rows = [

        [
            "Total Transactions",
            overview.totalTransactions || 0
        ],

        [
            "Successful Transactions",
            overview.successfulTransactions || 0
        ],

        [
            "Failed Transactions",
            overview.failedTransactions || 0
        ],

        [
            "Refunded Transactions",
            overview.refundedTransactions || 0
        ],

        [
            "Total Revenue",
            revenue.totalRevenue || 0
        ],

        [
            "Refund Amount",
            revenue.refundAmount || 0
        ],

        [
            "Net Revenue",
            revenue.netRevenue || 0
        ],

        [
            "Success Rate (%)",
            performance.successRate || 0
        ],

        [
            "Refund Rate (%)",
            performance.refundRate || 0
        ],

        [
            "Top Payment Mode",
            dashboard.topPaymentMode
                ? dashboard.topPaymentMode[0]
                : "-"
        ],

        [
            "Top Device",
            dashboard.topDevice
                ? dashboard.topDevice[0]
                : "-"
        ],

        [
            "Top Location",
            dashboard.topLocation
                ? dashboard.topLocation[0]
                : "-"
        ],

        [
            "Peak Month",
            dashboard.peakMonth
                ? dashboard.peakMonth[0]
                : "-"
        ]

    ];

    rows.forEach(row => sheet.addRow(row));

    // ---------- Currency Formatting ----------

    currencyStyle(sheet.getCell("B7"));
    currencyStyle(sheet.getCell("B8"));
    currencyStyle(sheet.getCell("B9"));

    // ---------- Borders ----------

    sheet.eachRow((row) => {

        row.eachCell((cell) => {

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