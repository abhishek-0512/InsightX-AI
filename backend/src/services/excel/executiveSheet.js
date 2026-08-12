const styles = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Executive Summary");

    sheet.columns = [
        { width: 35 }, // A: Metric / Month
        { width: 20 }, // B: Total / Transactions
        { width: 20 }, // C: Month 1 / GMV (Lakhs)
        { width: 20 }, // D: Month 2 / Avg Txn
        { width: 20 }, // E: Month 3 / Successful
        { width: 20 }, // F: Growth 1 / Failed
        { width: 20 }, // G: Growth 2 / Expired
        { width: 20 }, // H: Trend / Success Rate
        { width: 25 }, // I: Peak Day 1
        { width: 25 }, // J: Peak Day 2
        { width: 25 }  // K: Peak Day 3
    ];

    // ====================================================
    // 1. Report Header
    // ====================================================
    sheet.mergeCells("A1:K1");
    const mainTitle = sheet.getCell("A1");
    mainTitle.value = "INSIGHTX — TRANSACTION & FINANCIAL REPORT";
    styles.titleStyle(mainTitle);
    sheet.getRow(1).height = 30;

    sheet.mergeCells("A2:K2");
    const subTitle1 = sheet.getCell("A2");
    subTitle1.value = `Generated: ${new Date().toLocaleDateString("en-IN")} | Confidential Report`;
    subTitle1.font = { italic: true, color: { argb: "1E293B" } };
    subTitle1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };

    sheet.mergeCells("A3:K3");
    const subTitle2 = sheet.getCell("A3");
    subTitle2.value = `Total Records: ${analysis.payment?.overview?.totalTransactions || 0}`;
    subTitle2.font = { italic: true, color: { argb: "1E293B" } };
    subTitle2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };

    let row = 5;

    // ====================================================
    // 2. OVERALL PERFORMANCE SUMMARY 
    // ====================================================
    sheet.mergeCells(`A${row}:K${row}`);
    const summaryTitle = sheet.getCell(`A${row}`);
    summaryTitle.value = "OVERALL PERFORMANCE SUMMARY";
    styles.headerStyle(summaryTitle);
    summaryTitle.alignment = { horizontal: "left", vertical: "middle" };
    row++;

    const ov = analysis.payment?.overview || {};
    const rev = analysis.payment?.revenue || {};
    const mList = analysis.monthly?.monthlyList || [];
    const getM = (mName, field) => {
        const found = mList.find(m => m.month === mName);
        if (!found) return "-";
        return found[field] !== undefined ? found[field] : "-";
    };

    const months = mList.length ? mList.map(m => m.month) : Object.keys(analysis.monthly?.monthly || {});
    const m1 = months[0] || "Month 1";
    const m2 = months[1] || "Month 2";
    const m3 = months[2] || "Month 3";

    const perfHeaders = sheet.addRow([
        "Metric",
        "Total",
        m1,
        m2,
        m3,
        `${m1}-${m2} Growth`,
        `${m2}-${m3} Growth`,
        "Trend"
    ]);
    perfHeaders.eachCell((cell) => styles.headerStyle(cell));

    const succSales = ov.successfulSales !== undefined ? ov.successfulSales : Math.max(0, (ov.successfulTransactions || 0) - (ov.refundedTransactions || 0));

    const perfRows = [
        ["Total Transactions", ov.totalTransactions || 0, getM(m1, "transactions"), getM(m2, "transactions"), getM(m3, "transactions"), "-", "-", "Steady"],
        ["Total Successful Transactions (Sales + Refunds)", ov.successfulTransactions || 0, getM(m1, "successfulTransactions") || getM(m1, "success"), getM(m2, "successfulTransactions") || getM(m2, "success"), getM(m3, "successfulTransactions") || getM(m3, "success"), "-", "-", "Reconciled"],
        ["  • Successful Customer Sales", succSales, getM(m1, "successfulSales") || "-", getM(m2, "successfulSales") || "-", getM(m3, "successfulSales") || "-", "-", "-", "Growing"],
        ["  • Successful Customer Refunds", ov.refundedTransactions || 0, getM(m1, "refundedTransactions"), getM(m2, "refundedTransactions"), getM(m3, "refundedTransactions"), "-", "-", "Optimal"],
        ["Failed Transactions", ov.failedTransactions || 0, getM(m1, "failedTransactions") || getM(m1, "failed"), getM(m2, "failedTransactions") || getM(m2, "failed"), getM(m3, "failedTransactions") || getM(m3, "failed"), "-", "-", "Stable"],
        ["Total Gross GMV (₹ Lakhs)", Number(((rev.totalAmount || 0) / 100000).toFixed(2)), getM(m1, "grossAmount") ? Number((getM(m1, "grossAmount") / 100000).toFixed(2)) : "-", getM(m2, "grossAmount") ? Number((getM(m2, "grossAmount") / 100000).toFixed(2)) : "-", getM(m3, "grossAmount") ? Number((getM(m3, "grossAmount") / 100000).toFixed(2)) : "-", "-", "-", "Steady"],
        ["Refund Deductions (₹)", rev.refundAmount || 0, getM(m1, "refundAmount") || "-", getM(m2, "refundAmount") || "-", getM(m3, "refundAmount") || "-", "-", "-", "Deducted"],
        ["Net Realized Revenue (₹)", rev.netAmount || 0, getM(m1, "netAmount") || "-", getM(m2, "netAmount") || "-", getM(m3, "netAmount") || "-", "-", "-", "Settled"],
        ["Average Transaction (₹)", Number(((rev.totalAmount || 0) / (ov.totalTransactions || 1)).toFixed(2)), "-", "-", "-", "-", "-", "Stable"],
        ["Overall Success Rate (%)", `${analysis.payment?.successRate || 0}%`, "-", "-", "-", "-", "-", "Reconciled"]
    ];

    perfRows.forEach((r) => sheet.addRow(r));
    row = sheet.lastRow.number + 3;

    // ====================================================
    // 3. MONTH-WISE ANALYSIS
    // ====================================================
    sheet.mergeCells(`A${row}:K${row}`);
    const monthTitle = sheet.getCell(`A${row}`);
    monthTitle.value = "MONTH-WISE ANALYSIS";
    styles.headerStyle(monthTitle);
    monthTitle.alignment = { horizontal: "left", vertical: "middle" };
    row++;

    const monthHeaders = sheet.addRow([
        "Month",
        "Transactions",
        "GMV (₹ Lakhs)",
        "Avg Txn (₹)",
        "Successful",
        "Failed",
        "Successful Refunds",
        "Success Rate",
        "Net Revenue (₹)",
        "Top Channel"
    ]);
    monthHeaders.eachCell((cell) => styles.headerStyle(cell));

    (analysis.monthly?.monthlyList || []).forEach((m) => {
        sheet.addRow([
            m.month,
            m.transactions || 0,
            Number(((m.grossAmount || 0) / 100000).toFixed(2)),
            Number(((m.grossAmount || 0) / (m.transactions || 1)).toFixed(2)),
            m.successfulTransactions || 0,
            m.failedTransactions || 0,
            m.refundedTransactions || 0,
            `${m.successRate || 0}%`,
            m.netAmount || 0,
            m.topPaymentMode || "-"
        ]);
    });

    row = sheet.lastRow.number + 3;

    // ====================================================
    // 4. MONTH-ON-MONTH GROWTH
    // ====================================================
    if (months.length > 1) {
        sheet.mergeCells(`A${row}:D${row}`);
        const growthTitle = sheet.getCell(`A${row}`);
        growthTitle.value = "MONTH-ON-MONTH GROWTH";
        styles.headerStyle(growthTitle);
        growthTitle.alignment = { horizontal: "left", vertical: "middle" };
        row++;

        const growthHeaders = sheet.addRow(["Period", "Txn Growth", "GMV Growth", "Success Rate Δ"]);
        for (let i = 1; i <= 4; i++) {
            styles.headerStyle(growthHeaders.getCell(i));
        }

        const monthlyStats = analysis.monthly?.monthly || {};
        for (let i = 0; i < months.length - 1; i++) {
            const curM = monthlyStats[months[i]] || mList.find(m => m.month === months[i]) || {};
            const nextM = monthlyStats[months[i + 1]] || mList.find(m => m.month === months[i + 1]) || {};
            const txnGrowth = curM.transactions ? (((nextM.transactions - curM.transactions) / curM.transactions) * 100).toFixed(1) + "%" : "-";
            const gmvGrowth = curM.grossAmount ? (((nextM.grossAmount - curM.grossAmount) / curM.grossAmount) * 100).toFixed(1) + "%" : "-";
            const rateDiff = ((nextM.successRate || 0) - (curM.successRate || 0)).toFixed(1) + "%";
            sheet.addRow([`${months[i]} - ${months[i + 1]}`, txnGrowth, gmvGrowth, rateDiff]);
        }
    }

    // Borders
    sheet.eachRow((r, rowNumber) => {
        if (rowNumber > 3 && r.hasValues) {
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

    sheet.getColumn(4).numFmt = "₹#,##0.00";
    sheet.getColumn(9).numFmt = "₹#,##0.00";
};