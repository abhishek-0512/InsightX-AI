const styles = require("./styles");

module.exports = async (workbook, analysis) => {

    const sheet = workbook.addWorksheet("Executive Summary");

    sheet.columns = [
        { width: 45 },
        { width: 30 }
    ];

    styles.title(sheet, "PayVista Executive Business Report");

    let row = 3;

    // ================= KPIs =================

    sheet.getCell(`A${row}`).value = "KEY PERFORMANCE INDICATORS";
    sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row++;

    sheet.addRow(["Total Transactions", analysis.payment.overview.totalTransactions]);
    sheet.addRow(["Successful Transactions", analysis.payment.overview.successfulTransactions]);
    sheet.addRow(["Failed Transactions", analysis.payment.overview.failedTransactions]);
    sheet.addRow(["Refunded Transactions", analysis.payment.overview.refundedTransactions]);
    sheet.addRow(["Success Rate", `${analysis.payment.successRate}%`]);
    sheet.addRow(["Refund Rate", `${analysis.payment.refundRate}%`]);
    sheet.addRow(["Gross Revenue", analysis.payment.revenue.totalAmount]);
    sheet.addRow(["Net Revenue", analysis.payment.revenue.netAmount]);

    row = sheet.lastRow.number + 2;

    // ================= TOP PAYMENT MODES =================

    sheet.getCell(`A${row}`).value = "TOP PAYMENT MODES";
    sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row++;

    sheet.addRow(["Payment Mode", "Transactions"]);

    Object.entries(analysis.payment.paymentModes || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([mode, count]) => {
            sheet.addRow([mode, count]);
        });

    row = sheet.lastRow.number + 2;

    // ================= DEVICE SUMMARY =================

    if (analysis.device.available) {

        sheet.getCell(`A${row}`).value = "DEVICE SUMMARY";
        sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
        row++;

        Object.entries(analysis.device.operatingSystems).forEach(([os, value]) => {
            sheet.addRow([
                os.toUpperCase(),
                `${value.count} (${value.percentage}%)`
            ]);
        });

        row = sheet.lastRow.number + 2;
    }

    // ================= MONTHLY TREND =================

    if (analysis.monthly.available) {

        sheet.getCell(`A${row}`).value = "MONTHLY PERFORMANCE";
        sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
        row++;

        sheet.addRow(["Month", "Transactions", "Revenue"]);

        Object.entries(analysis.monthly.monthly).forEach(([month, stats]) => {
            sheet.addRow([
                month,
                stats.transactions,
                stats.amount
            ]);
        });

        row = sheet.lastRow.number + 2;
    }

    // ================= AI INSIGHTS =================

    sheet.getCell(`A${row}`).value = "EXECUTIVE INSIGHTS";
    sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row++;

    const insights = [];

    if (analysis.payment.successRate >= 95)
        insights.push("Excellent payment success rate observed.");

    else if (analysis.payment.successRate >= 85)
        insights.push("Payment success rate is good with room for improvement.");

    else
        insights.push("Payment failures are relatively high and require investigation.");

    if (analysis.refund.available && analysis.refund.refundPercentage > 10)
        insights.push("Refund percentage is higher than expected.");

    if (analysis.device.topDevice)
        insights.push(`Most customers use ${analysis.device.topDevice[0]} devices.`);

    if (analysis.monthly.available && analysis.monthly.peakMonth)
        insights.push(`Peak transaction month: ${analysis.monthly.peakMonth[0]}.`);

    const topMode = Object.entries(analysis.payment.paymentModes || {})
        .sort((a, b) => b[1] - a[1])[0];

    if (topMode)
        insights.push(`${topMode[0]} is the preferred payment mode.`);

    insights.forEach(text => {
        sheet.addRow([`• ${text}`]);
    });

    sheet.eachRow((currentRow, index) => {
        if (index === 1) return;
        styles.dataRow(currentRow);
    });

};