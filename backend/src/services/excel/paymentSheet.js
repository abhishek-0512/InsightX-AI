const {
    titleStyle,
    headerStyle,
    autoFitColumns
} = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Payment Analytics");

    // ---------- Title ----------
    sheet.mergeCells("A1:C1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Payment Analytics";
    titleStyle(titleCell);

    // ---------- Payment Mode Summary ----------
    sheet.addRow([]);
    const headerRow = sheet.addRow(["Payment Mode", "Transactions"]);

    headerStyle(headerRow.getCell(1));
    headerStyle(headerRow.getCell(2));

    const paymentModes = analysis.payment?.paymentModes || {};

    Object.entries(paymentModes).forEach(([mode, count]) => {
        sheet.addRow([mode, count]);
    });

    // ---------- Revenue ----------
    let rowNumber = sheet.lastRow.number + 2;

    const revenueHeader = sheet.getCell(`A${rowNumber}`);
    revenueHeader.value = "Revenue Summary";
    headerStyle(revenueHeader);

    const totalRevRow = sheet.addRow([
        "Total Revenue",
        analysis.payment?.revenue?.totalAmount || 0
    ]);
    
    const refundRevRow = sheet.addRow([
        "Refund Amount",
        analysis.payment?.revenue?.refundAmount || 0
    ]);
    
    const netRevRow = sheet.addRow([
        "Net Revenue",
        analysis.payment?.revenue?.netAmount || 0
    ]);

    totalRevRow.getCell(2).numFmt = '₹#,##0.00';
    refundRevRow.getCell(2).numFmt = '₹#,##0.00';
    netRevRow.getCell(2).numFmt = '₹#,##0.00';

    // ---------- Success / Failure ----------
    rowNumber = sheet.lastRow.number + 2;

    const transactionHeader = sheet.getCell(`A${rowNumber}`);
    transactionHeader.value = "Transaction Summary";
    headerStyle(transactionHeader);

    sheet.addRow([
        "Successful",
        analysis.payment?.overview?.successfulTransactions || 0
    ]);

    sheet.addRow([
        "Failed",
        analysis.payment?.overview?.failedTransactions || 0
    ]);

    sheet.addRow([
        "Refunded",
        analysis.payment?.overview?.refundedTransactions || 0
    ]);

    sheet.addRow([
        "Success Rate (%)",
        analysis.payment?.successRate || 0
    ]);

    sheet.addRow([
        "Refund Rate (%)",
        analysis.payment?.refundRate || 0
    ]);

    // ---------- Borders ----------
    sheet.eachRow((r) => {
        if (r.hasValues) {
            r.eachCell({ includeEmpty: false }, (cell) => {
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