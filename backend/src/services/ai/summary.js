const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(value || 0);
};

exports.generateSummary = (analysis = {}) => {
    const report = [];

    const dataset = analysis.summary?.dataset || {
        totalRows: analysis.payment?.overview?.totalTransactions || 0,
        totalColumns: 0
    };
    const quality = analysis.quality || {
        missingValues: 0,
        duplicateRows: 0,
        completeness: 100
    };
    const payment = analysis.payment || {};
    const overview = payment.overview || {};
    const revenue = payment.revenue || {};

    report.push("========== INSIGHTX AI REPORT ==========");
    report.push("");

    report.push(`Total Records : ${formatNumber(dataset.totalRows)}`);
    if (dataset.totalColumns) report.push(`Total Columns : ${dataset.totalColumns}`);
    report.push(`Missing Values : ${formatNumber(quality.missingValues)}`);
    report.push(`Duplicate Rows : ${formatNumber(quality.duplicateRows)}`);
    report.push(`Completeness : ${quality.completeness}%`);
    report.push("");

    // ---------- Financial Performance ----------
    if (overview.totalTransactions) {
        report.push("FINANCIAL & TRANSACTION PERFORMANCE");
        report.push(`  • Total Transactions : ${formatNumber(overview.totalTransactions)}`);
        report.push(`  • Total Successful Tx (Sales + Refunds) : ${formatNumber(overview.successfulTransactions)}`);
        report.push(`  • Successful Customer Sales : ${formatNumber(overview.successfulSales || Math.max(0, (overview.successfulTransactions || 0) - (overview.refundedTransactions || 0)))}`);
        report.push(`  • Refunded Operations : ${formatNumber(overview.refundedTransactions)}`);
        report.push(`  • Failed Transactions : ${formatNumber(overview.failedTransactions)}`);
        report.push(`  • Overall Success Rate : ${payment.successRate || 0}%`);
        report.push(`  • Gross Revenue : ₹${(revenue.totalAmount || revenue.grossAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
        report.push(`  • Refund Deductions : ₹${(revenue.refundAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
        report.push(`  • Net Realized Revenue : ₹${(revenue.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
        report.push("");
    }

    // ---------- Numeric ----------
    if (analysis.numeric && Object.keys(analysis.numeric).length) {
        report.push("NUMERIC ANALYSIS");
        Object.entries(analysis.numeric).forEach(([column, stats]) => {
            report.push(
                `${column}
  • Sum : ${stats.sum}
  • Average : ${stats.average}
  • Min : ${stats.minimum}
  • Max : ${stats.maximum}
  • Median : ${stats.median}`
            );
        });
        report.push("");
    }

    // ---------- Categorical ----------
    if (analysis.categorical && Object.keys(analysis.categorical).length) {
        report.push("CATEGORICAL ANALYSIS");
        Object.entries(analysis.categorical).forEach(([column, data]) => {
            report.push(
                `${column}
  • Most Frequent : ${data.topValue}
  • Count : ${data.topCount}
  • Unique Values : ${data.uniqueValues}`
            );
        });
        report.push("");
    }

    // ---------- Date ----------
    if (analysis.datetime && Object.keys(analysis.datetime).length) {
        report.push("DATE ANALYSIS");
        Object.entries(analysis.datetime).forEach(([column, data]) => {
            report.push(
                `${column}
  • Earliest : ${data.earliest ? new Date(data.earliest).toLocaleString() : "-" }
  • Latest : ${data.latest ? new Date(data.latest).toLocaleString() : "-" }`
            );
        });
        report.push("");
    }

    // ---------- AI Insights ----------
    report.push("AI INSIGHTS");
    if (quality.completeness >= 95)
        report.push("• Excellent data quality.");
    else if (quality.completeness >= 80)
        report.push("• Good quality dataset with few missing values.");
    else
        report.push("• Dataset requires cleaning before analysis.");

    if (quality.duplicateRows > 0)
        report.push(`• ${quality.duplicateRows} duplicate records detected.`);

    if (overview.totalTransactions) {
        report.push(`• Processed ${formatNumber(overview.totalTransactions)} transactions with ${payment.successRate || 0}% overall success rate.`);
        if (overview.refundedTransactions > 0) {
            report.push(`• ${formatNumber(overview.refundedTransactions)} refunds processed totaling ₹${(revenue.refundAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`);
        }
    }

    if (analysis.numeric) {
        Object.entries(analysis.numeric).forEach(([column, stats]) => {
            report.push(`• Average ${column} is ${stats.average}.`);
        });
    }

    if (analysis.categorical) {
        Object.entries(analysis.categorical).forEach(([column, data]) => {
            report.push(`• "${data.topValue}" is the dominant value in ${column}.`);
        });
    }

    report.push("");
    report.push("========================================");

    return report.join("\n");
};