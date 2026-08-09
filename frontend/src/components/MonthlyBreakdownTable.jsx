import { FaCalendarAlt, FaArrowRight, FaChartLine, FaCheckSquare, FaSquare } from "react-icons/fa";
import { useAnalysis } from "../context/AnalysisContext";

function formatCurrency(val) {
    if (val === undefined || val === null || isNaN(val)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(val);
}

function MonthlyBreakdownTable() {
    const {
        cumulativeAnalysis,
        activePeriod,
        selectedMonths,
        selectSingleMonth,
        toggleMonth,
        selectCumulative
    } = useAnalysis();

    const monthlyList = cumulativeAnalysis?.monthly?.monthlyList || [];
    if (!monthlyList.length) return null;

    const isSingleMonth = monthlyList.length === 1;

    // Calculate cumulative totals across all months
    let totalTx = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalRefunds = 0;
    let totalRefundAmount = 0;
    let totalGross = 0;
    let totalNet = 0;

    monthlyList.forEach((m) => {
        totalTx += m.transactions;
        totalSuccess += m.successfulTransactions;
        totalFailed += m.failedTransactions;
        totalRefunds += m.refundedTransactions;
        totalRefundAmount += m.refundAmount;
        totalGross += m.grossAmount;
        totalNet += m.netAmount;
    });

    const cumulativeSuccessRate = totalTx > 0 ? Number(((totalSuccess / totalTx) * 100).toFixed(2)) : 0;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400">
                        <FaChartLine size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {isSingleMonth ? "Monthly Dataset Performance" : "Month-by-Month Performance & Comparison"}
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                {isSingleMonth ? `${monthlyList[0].month}` : `${monthlyList.length} Months Detected`}
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400">
                            {isSingleMonth
                                ? `Complete cumulative metrics for ${monthlyList[0].month}`
                                : "Select any single month, combine multiple months together, or view full cumulative totals"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={selectCumulative}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                            activePeriod === "all"
                                ? "bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20"
                                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                        }`}
                    >
                        {isSingleMonth ? "Full Month View" : "All Months Combined"}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                            <th className="py-3 px-4">Month</th>
                            <th className="py-3 px-3 text-right">Total Tx</th>
                            <th className="py-3 px-3 text-right">Successful</th>
                            <th className="py-3 px-3 text-right">Failed</th>
                            <th className="py-3 px-3 text-right">Successful Refunds</th>
                            <th className="py-3 px-3 text-right">Refund Amount</th>
                            <th className="py-3 px-3 text-right">Gross Revenue</th>
                            <th className="py-3 px-3 text-right">Net Revenue</th>
                            <th className="py-3 px-3 text-center">Success Rate</th>
                            <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                        {monthlyList.map((m) => {
                            const isSelected =
                                activePeriod === "all" ||
                                (activePeriod === "months" && selectedMonths.includes(m.month));

                            const isSingleActive =
                                activePeriod === "months" &&
                                selectedMonths.length === 1 &&
                                selectedMonths[0] === m.month;

                            return (
                                <tr
                                    key={m.month}
                                    className={`transition duration-150 ${
                                        isSingleActive
                                            ? "bg-cyan-950/40 border-l-4 border-l-cyan-400"
                                            : isSelected && activePeriod === "months"
                                            ? "bg-cyan-950/20"
                                            : "hover:bg-slate-800/40"
                                    }`}
                                >
                                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                                        {!isSingleMonth && (
                                            <button
                                                onClick={() => toggleMonth(m.month)}
                                                className="text-slate-400 hover:text-cyan-400 transition"
                                                title="Toggle month in cumulative combination"
                                            >
                                                {isSelected && activePeriod === "months" ? (
                                                    <FaCheckSquare className="text-cyan-400" size={14} />
                                                ) : (
                                                    <FaSquare className="text-slate-600" size={14} />
                                                )}
                                            </button>
                                        )}
                                        <FaCalendarAlt className="text-cyan-400 text-xs" />
                                        <span>{m.month}</span>
                                        {isSingleActive && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                                        {m.transactions.toLocaleString()}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-mono text-emerald-400">
                                        {m.successfulTransactions.toLocaleString()}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-mono text-rose-400">
                                        {m.failedTransactions.toLocaleString()}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-mono text-amber-400">
                                        {m.refundedTransactions.toLocaleString()}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-mono text-amber-300">
                                        {formatCurrency(m.refundAmount)}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                                        {formatCurrency(m.grossAmount)}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-mono font-bold text-cyan-400">
                                        {formatCurrency(m.netAmount)}
                                    </td>
                                    <td className="py-3.5 px-3 text-center">
                                        <span
                                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                                                m.successRate >= 80
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : m.successRate >= 50
                                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                            }`}
                                        >
                                            {m.successRate}%
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <button
                                            onClick={() => selectSingleMonth(m.month)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                                isSingleActive
                                                    ? "bg-cyan-500 text-white shadow"
                                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                                            }`}
                                        >
                                            <span>{isSingleActive ? "Viewing" : "Analyze"}</span>
                                            <FaArrowRight size={10} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Cumulative Total Row */}
                        {!isSingleMonth && (
                            <tr className="bg-slate-950 font-bold text-white border-t-2 border-slate-700">
                                <td className="py-4 px-4 uppercase tracking-wider text-xs text-cyan-400 flex items-center gap-2">
                                    <span>All Months Combined Total</span>
                                </td>
                                <td className="py-4 px-3 text-right font-mono text-cyan-300">
                                    {totalTx.toLocaleString()}
                                </td>
                                <td className="py-4 px-3 text-right font-mono text-emerald-400">
                                    {totalSuccess.toLocaleString()}
                                </td>
                                <td className="py-4 px-3 text-right font-mono text-rose-400">
                                    {totalFailed.toLocaleString()}
                                </td>
                                <td className="py-4 px-3 text-right font-mono text-amber-400">
                                    {totalRefunds.toLocaleString()}
                                </td>
                                <td className="py-4 px-3 text-right font-mono text-amber-300">
                                    {formatCurrency(totalRefundAmount)}
                                </td>
                                <td className="py-4 px-3 text-right font-mono text-slate-100">
                                    {formatCurrency(totalGross)}
                                </td>
                                <td className="py-4 px-3 text-right font-mono text-cyan-400 text-base">
                                    {formatCurrency(totalNet)}
                                </td>
                                <td className="py-4 px-3 text-center">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                        {cumulativeSuccessRate}%
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    {activePeriod !== "all" && (
                                        <button
                                            onClick={selectCumulative}
                                            className="text-xs text-cyan-400 hover:underline font-semibold"
                                        >
                                            View All
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MonthlyBreakdownTable;
