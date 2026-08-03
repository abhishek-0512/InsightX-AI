const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(value);
};

exports.generateSummary = (analysis) => {

    const report = [];

    const dataset = analysis.summary.dataset;
    const quality = analysis.quality;

    report.push("========== INSIGHTX AI REPORT ==========");
    report.push("");

    report.push(`Total Records : ${formatNumber(dataset.totalRows)}`);
    report.push(`Total Columns : ${dataset.totalColumns}`);
    report.push(`Missing Values : ${formatNumber(quality.missingValues)}`);
    report.push(`Duplicate Rows : ${formatNumber(quality.duplicateRows)}`);
    report.push(`Completeness : ${quality.completeness}%`);
    report.push("");

    // ---------- Numeric ----------

    if (Object.keys(analysis.numeric).length) {

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

    if (Object.keys(analysis.categorical).length) {

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

    if (Object.keys(analysis.datetime).length) {

        report.push("DATE ANALYSIS");

        Object.entries(analysis.datetime).forEach(([column, data]) => {

            report.push(
                `${column}
  • Earliest : ${new Date(data.earliest).toLocaleString()}
  • Latest : ${new Date(data.latest).toLocaleString()}`
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
        report.push(
            `• ${quality.duplicateRows} duplicate records detected.`
        );

    Object.entries(analysis.numeric).forEach(([column, stats]) => {

        report.push(
            `• Average ${column} is ${stats.average}.`
        );

    });

    Object.entries(analysis.categorical).forEach(([column, data]) => {

        report.push(
            `• "${data.topValue}" is the dominant value in ${column}.`
        );

    });

    report.push("");
    report.push("========================================");

    return report.join("\n");
};