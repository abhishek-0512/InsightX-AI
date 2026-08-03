const {
    titleStyle,
    headerStyle,
    currencyStyle,
    autoFitColumns
} = require("./styles");

module.exports = async (workbook, analysis) => {

    const sheet = workbook.addWorksheet("Payment Analytics");

    // ---------- Title ----------

    sheet.mergeCells("A1:C1");
    sheet.getCell("A1").value = "Payment Analytics";
    titleStyle(sheet.getCell("A1"));

    // ---------- Payment Mode Summary ----------

    sheet.addRow([]);
    sheet.addRow(["Payment Mode", "Transactions"]);

    headerStyle(sheet.getCell("A3"));
    headerStyle(sheet.getCell("B3"));

    const paymentModes =
        analysis.payment?.paymentModes || {};

    Object.entries(paymentModes).forEach(
        ([mode, count]) => {

            sheet.addRow([
                mode,
                count
            ]);

        }
    );

    // ---------- Revenue ----------

    let row = sheet.lastRow.number + 2;

    sheet.getCell(`A${row}`).value = "Revenue Summary";
    headerStyle(sheet.getCell(`A${row}`));

    row++;

    sheet.addRow([
        "Total Revenue",
        analysis.payment?.revenue?.totalAmount || 0
    ]);

    sheet.addRow([
        "Refund Amount",
        analysis.payment?.revenue?.refundAmount || 0
    ]);

    sheet.addRow([
        "Net Revenue",
        analysis.payment?.revenue?.netAmount || 0
    ]);

    currencyStyle(sheet.getCell(`B${row}`));
    currencyStyle(sheet.getCell(`B${row + 1}`));
    currencyStyle(sheet.getCell(`B${row + 2}`));

    // ---------- Success / Failure ----------

    row = sheet.lastRow.number + 2;

    sheet.getCell(`A${row}`).value = "Transaction Summary";
    headerStyle(sheet.getCell(`A${row}`));

    row++;

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