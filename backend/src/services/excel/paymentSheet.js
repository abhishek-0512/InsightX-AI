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
    sheet.getCell("A1").value = "Payment & Revenue Analytics";
    titleStyle(sheet.getCell("A1"));
    sheet.getRow(1).height = 28;

    // ---------- Payment Mode Summary ----------
    sheet.addRow([]);
    const modeHeader = sheet.addRow(["Payment Mode", "Successful Volume", "Share (%)"]);
    headerStyle(modeHeader.getCell(1));
    headerStyle(modeHeader.getCell(2));
    headerStyle(modeHeader.getCell(3));

    const paymentModes = analysis.payment?.paymentModes || {};
    const totalTransactions = analysis.payment?.overview?.totalTransactions || 1;

    Object.entries(paymentModes).forEach(([mode, count]) => {
        const share = Number(((count / totalTransactions) * 100).toFixed(2));
        sheet.addRow([mode, count, `${share}%`]);
    });

    // ---------- Revenue Summary ----------
    let row = sheet.lastRow.number + 2;
    sheet.getCell(`A${row}`).value = "Revenue Performance";
    sheet.getCell(`A${row}`).font = { bold: true, size: 13 };
    row++;

    const revHeader = sheet.addRow(["Financial Metric", "Amount (₹)"]);
    headerStyle(revHeader.getCell(1));
    headerStyle(revHeader.getCell(2));

    const r1 = sheet.addRow(["Gross Revenue", analysis.payment?.revenue?.totalAmount || 0]);
    const r2 = sheet.addRow(["Refund Amount (Successful Only)", analysis.payment?.revenue?.refundAmount || 0]);
    const r3 = sheet.addRow(["Net Revenue", analysis.payment?.revenue?.netAmount || 0]);

    currencyStyle(r1.getCell(2));
    currencyStyle(r2.getCell(2));
    currencyStyle(r3.getCell(2));

    // ---------- Transaction Summary ----------
    row = sheet.lastRow.number + 2;
    sheet.getCell(`A${row}`).value = "Transaction Summary";
    sheet.getCell(`A${row}`).font = { bold: true, size: 13 };
    row++;

    const txHeader = sheet.addRow(["Operational Metric", "Value"]);
    headerStyle(txHeader.getCell(1));
    headerStyle(txHeader.getCell(2));

    sheet.addRow(["Total Transactions", analysis.payment?.overview?.totalTransactions || 0]);
    sheet.addRow(["Successful Transactions", analysis.payment?.overview?.successfulTransactions || 0]);
    sheet.addRow(["Successful Refunds", analysis.payment?.overview?.refundedTransactions || 0]);
    sheet.addRow(["Success Rate", `${analysis.payment?.successRate || 0}%`]);
    sheet.addRow(["Refund Rate", `${analysis.payment?.refundRate || 0}%`]);

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