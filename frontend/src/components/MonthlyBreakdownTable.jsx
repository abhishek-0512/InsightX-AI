import { FaCalendarAlt, FaArrowRight, FaChartLine, FaCheckSquare, FaSquare } from "react-icons/fa";
import { useAnalysis } from "../context/AnalysisContext";

function MonthlyBreakdownTable() {
    const {
        cumulativeAnalysis,
        activePeriod,
        selectedMonths,
        selectSingleMonth,
        toggleMonth,
        selectCumulative,
        formatCurrency,
        currencySymbol
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
        <section className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                        <FaChartLine size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-xl font-extrabold text-white tracking-tight">
                                {isSingleMonth ? "Monthly Performance Summary" : "Month-by-Month Financial Performance"}
                            </h2>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                                {isSingleMonth ? `${monthlyList[0].month}` : `${monthlyList.length} Months Detected`}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {isSingleMonth
                                ? `Complete reconciled financial metrics for ${monthlyList[0].month}`
                                : "Select any single month to filter, or check multiple months to combine them together"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={selectCumulative}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                            activePeriod === "all"
                                ? "bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/25"
                                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
                        }`}
                    >
                        {isSingleMonth ? "View All Data" : "All Months Combined"}
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto mt-6 rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                            <th className="py-4 px-5">Billing Month</th>
                            <th className="py-4 px-4 text-right">Total Volume</th>
                            <th className="py-4 px-4 text-right">Successful Tx</th>
                            <th className="py-4 px-4 text-right">Failed Tx</th>
                            <th className="py-4 px-4 text-right">Refunds</th>
                            <th className="py-4 px-4 text-right">Refund Deductions ({currencySymbol})</th>
                            <th className="py-4 px-4 text-right">Gross Revenue ({currencySymbol})</th>
                            <th className="py-4 px-5 text-right text-cyan-400 font-extrabold">Net Realized Revenue ({currencySymbol})</th>
                            <th className="py-4 px-4 text-center">Success Rate</th>
                            <th className="py-4 px-5 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-medium">
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
                                            ? "bg-cyan-950/50 border-l-4 border-l-cyan-400"
                                            : isSelected && activePeriod === "months"
                                            ? "bg-cyan-950/20"
                                            : "hover:bg-slate-900/60"
                                    }`}
                                >
                                    {/* Month Name & Toggle */}
                                    <td className="py-4 px-5 font-bold text-white flex items-center gap-3">
                                        {!isSingleMonth && (
                                            <button
                                                onClick={() => toggleMonth(m.month)}
                                                className="text-slate-500 hover:text-cyan-400 transition cursor-pointer"
                                                title="Check to combine in multi-month analysis"
                                            >
                                                {isSelected && activePeriod === "months" ? (
                                                    <FaCheckSquare className="text-cyan-400" size={16} />
                                                ) : (
                                                    <FaSquare className="text-slate-700" size={16} />
                                                )}
                                            </button>
                                        )}
                                        <FaCalendarAlt className="text-cyan-400 text-xs" />
                                        <span className="text-sm">{m.month}</span>
                                        {isSingleActive && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                                                Active View
                                            </span>
                                        )}
                                    </td>

                                    {/* Total Transactions */}
                                    <td className="py-4 px-4 text-right font-mono text-slate-200">
                                        {m.transactions.toLocaleString()}
                                    </td>

                                    {/* Successful Transactions */}
                                    <td className="py-4 px-4 text-right font-mono text-emerald-400 font-semibold">
                                        {m.successfulTransactions.toLocaleString()}
                                    </td>

                                    {/* Failed Transactions */}
                                    <td className="py-4 px-4 text-right font-mono text-slate-400">
                                        {m.failedTransactions.toLocaleString()}
                                    </td>

                                    {/* Successful Refunds */}
                                    <td className="py-4 px-4 text-right font-mono text-amber-400">
                                        {m.refundedTransactions.toLocaleString()}
                                    </td>

                                    {/* Refund Amount */}
                                    <td className="py-4 px-4 text-right font-mono text-amber-300">
                                        {formatCurrency(m.refundAmount)}
                                    </td>

                                    {/* Gross Revenue */}
                                    <td className="py-4 px-4 text-right font-mono text-slate-200">
                                        {formatCurrency(m.grossAmount)}
                                    </td>

                                    {/* Net Revenue */}
                                    <td className="py-4 px-5 text-right font-mono font-black text-cyan-400 text-base">
                                        {formatCurrency(m.netAmount)}
                                    </td>

                                    {/* Success Rate */}
                                    <td className="py-4 px-4 text-center">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                                                m.successRate >= 80
                                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                    : m.successRate >= 50
                                                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                            }`}
                                        >
                                            {m.successRate}%
                                        </span>
                                    </td>

                                    {/* Action Button */}
                                    <td className="py-4 px-5 text-center">
                                        <button
                                            onClick={() => selectSingleMonth(m.month)}
                                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                isSingleActive
                                                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300/40"
                                                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700"
                                            }`}
                                        >
                                            <span>{isSingleActive ? "Active" : "Inspect"}</span>
                                            <FaArrowRight size={10} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Cumulative Total Row */}
                        {!isSingleMonth && (
                            <tr className="bg-slate-950 font-bold text-white border-t-2 border-slate-700">
                                <td className="py-4 px-5 uppercase tracking-wider text-xs text-cyan-400 flex items-center gap-2">
                                    <span>All Months Total</span>
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-cyan-300">
                                    {totalTx.toLocaleString()}
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-emerald-400">
                                    {totalSuccess.toLocaleString()}
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-slate-400">
                                    {totalFailed.toLocaleString()}
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-amber-400">
                                    {totalRefunds.toLocaleString()}
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-amber-300">
                                    {formatCurrency(totalRefundAmount)}
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-slate-100">
                                    {formatCurrency(totalGross)}
                                </td>
                                <td className="py-4 px-5 text-right font-mono text-cyan-400 text-lg font-black">
                                    {formatCurrency(totalNet)}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                        {cumulativeSuccessRate}%
                                    </span>
                                </td>
                                <td className="py-4 px-5 text-center">
                                    {activePeriod !== "all" && (
                                        <button
                                            onClick={selectCumulative}
                                            className="text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
                                        >
                                            Reset View
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default MonthlyBreakdownTable;
