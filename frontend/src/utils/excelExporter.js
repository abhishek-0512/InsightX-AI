/**
 * Creates and downloads a formatted Excel report or CSV export directly in the browser
 */
export async function exportExcelInBrowser(rows, analysis, fileName = "InsightX_Report.xlsx") {
    try {
        const XLSX = await import("xlsx");
        const wb = XLSX.utils.book_new();

        // 1. Executive Summary Sheet
        const execData = [
            ["InsightX AI — Executive Business & Revenue Report"],
            [`Generated: ${new Date().toLocaleString("en-IN")}`],
            [],
            ["1. KEY PERFORMANCE INDICATORS (CUMULATIVE)"],
            ["Performance Metric", "Volume / Rate", "Financial Metric", "Amount (₹)"],
            [
                "Total Transactions",
                analysis.payment?.overview?.totalTransactions || 0,
                "Gross Revenue",
                analysis.payment?.revenue?.totalAmount || 0
            ],
            [
                "Successful Transactions",
                analysis.payment?.overview?.successfulTransactions || 0,
                "Refund Deductions",
                analysis.payment?.revenue?.refundAmount || 0
            ],
            [
                "Successful Refunds",
                analysis.payment?.overview?.refundedTransactions || 0,
                "Net Realized Revenue",
                analysis.payment?.revenue?.netAmount || 0
            ],
            [
                "Success Rate",
                `${analysis.payment?.successRate || 0}%`,
                "Refund Rate",
                `${analysis.payment?.refundRate || 0}%`
            ],
            [],
            ["2. TOP PAYMENT CHANNELS"],
            ["Channel", "Transaction Volume"]
        ];

        Object.entries(analysis.payment?.paymentModes || {}).forEach(([mode, count]) => {
            execData.push([mode, count]);
        });

        execData.push([]);
        execData.push(["3. AI EXECUTIVE INSIGHTS"]);
        (analysis.aiSummary || []).forEach((ins) => {
            execData.push([`• ${ins}`]);
        });

        const wsExec = XLSX.utils.aoa_to_sheet(execData);
        XLSX.utils.book_append_sheet(wb, wsExec, "Executive Summary");

        // 2. Monthly Breakdown Sheet
        const monthlyList = analysis.monthly?.monthlyList || [];
        if (monthlyList.length > 0) {
            const monthHeaders = [
                "Billing Month",
                "Total Volume",
                "Successful Tx",
                "Successful Refunds",
                "Refund Deductions (₹)",
                "Gross Revenue (₹)",
                "Net Revenue (₹)",
                "Success Rate (%)",
                "Top Channel"
            ];

            const monthRows = monthlyList.map((m) => [
                m.month,
                m.transactions,
                m.successfulTransactions,
                m.refundedTransactions,
                m.refundAmount,
                m.grossAmount,
                m.netAmount,
                `${m.successRate}%`,
                m.topPaymentMode || "-"
            ]);

            const wsMonth = XLSX.utils.aoa_to_sheet([monthHeaders, ...monthRows]);
            XLSX.utils.book_append_sheet(wb, wsMonth, "Monthly Breakdown");
        }

        // 3. Raw Data Sheet
        if (rows && rows.length > 0) {
            const wsRaw = XLSX.utils.json_to_sheet(rows.slice(0, 5000));
            XLSX.utils.book_append_sheet(wb, wsRaw, "Raw Transactions");
        }

        // Save & Trigger Download
        const cleanFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
        XLSX.writeFile(wb, cleanFileName);
    } catch (err) {
        console.warn("XLSX export fallback to CSV:", err);
        // Fallback: CSV export of raw rows
        if (rows && rows.length > 0) {
            const headers = Object.keys(rows[0]);
            const csvRows = [headers.join(",")];
            rows.forEach((r) => {
                const values = headers.map((h) => `"${String(r[h] || "").replace(/"/g, '""')}"`);
                csvRows.push(values.join(","));
            });
            const csvBlob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(csvBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${fileName.replace(/\.xlsx$/, "")}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
}
