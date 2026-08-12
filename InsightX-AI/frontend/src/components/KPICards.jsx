import { FaExchangeAlt, FaCheckCircle, FaWallet, FaCoins } from "react-icons/fa";
import { useAnalysis } from "../context/AnalysisContext";

function KPICards() {
    const {
        result,
        activePeriod,
        selectedMonths,
        formatCurrency,
        currencySymbol
    } = useAnalysis();

    const analysis = result?.analysis;
    if (!analysis) return null;

    const totalTx = analysis?.payment?.overview?.totalTransactions || 0;
    const successTx = analysis?.payment?.overview?.successfulTransactions || 0;
    const successSales = analysis?.payment?.overview?.successfulSales !== undefined
        ? analysis.payment.overview.successfulSales
        : Math.max(0, successTx - (analysis?.payment?.overview?.refundedTransactions || 0));
    const failedTx = analysis?.payment?.overview?.failedTransactions || 0;
    const refundedTx = analysis?.payment?.overview?.refundedTransactions || 0;

    const successRate = analysis?.payment?.successRate || 0;
    const refundRate = analysis?.payment?.refundRate || 0;

    const grossRevenue = analysis?.payment?.revenue?.totalAmount || 0;
    const refundAmount = analysis?.payment?.revenue?.refundAmount || 0;
    const attemptedSalesAmount = analysis?.payment?.revenue?.attemptedSalesAmount || 0;
    const netRevenue =
        analysis?.payment?.revenue?.netAmount !== undefined
            ? analysis.payment.revenue.netAmount
            : Math.max(0, grossRevenue - refundAmount);

    let periodLabel = "Cumulative (All Months)";
    if (activePeriod === "months") {
        if (selectedMonths.length === 1) {
            periodLabel = `Month: ${selectedMonths[0]}`;
        } else if (selectedMonths.length > 1) {
            periodLabel = `${selectedMonths.length} Months Combined`;
        }
    } else if (activePeriod === "1m") {
        periodLabel = "Last 30 Days";
    } else if (activePeriod === "3m") {
        periodLabel = "Last 90 Days";
    } else if (activePeriod === "6m") {
        periodLabel = "Last 6 Months";
    } else if (activePeriod === "custom") {
        periodLabel = "Custom Range";
    }

    const cards = [
        {
            title: "Total Transactions",
            value: totalTx.toLocaleString(),
            icon: <FaExchangeAlt className="text-cyan-400" size={18} />,
            iconBg: "bg-cyan-500/10 border-cyan-500/20",
            textColor: "text-cyan-400",
            primarySub: `${successTx.toLocaleString()} Successful (${successSales.toLocaleString()} Sales + ${refundedTx.toLocaleString()} Refunds)`,
            secondarySub: `${failedTx.toLocaleString()} Failed Attempts`,
            badge: periodLabel
        },
        {
            title: "Overall Success Rate",
            value: `${successRate}%`,
            icon: <FaCheckCircle className="text-emerald-400" size={18} />,
            iconBg: "bg-emerald-500/10 border-emerald-500/20",
            textColor: "text-emerald-400",
            primarySub: `${successTx.toLocaleString()} of ${totalTx.toLocaleString()} Completed`,
            secondarySub: `${((100 - successRate) || 0).toFixed(1)}% decline drop-off`,
            badge: "Sales + Refunds"
        },
        {
            title: "Gross Sales Revenue",
            value: formatCurrency(grossRevenue),
            icon: <FaCoins className="text-amber-400" size={18} />,
            iconBg: "bg-amber-500/10 border-amber-500/20",
            textColor: "text-amber-400",
            primarySub: `From ${successSales.toLocaleString()} completed customer sales`,
            secondarySub: attemptedSalesAmount > 0 ? `Total Attempted: ${formatCurrency(attemptedSalesAmount)}` : `Settled Revenue`,
            badge: `Completed Sales (${currencySymbol})`
        },
        {
            title: "Net Realized Revenue",
            value: formatCurrency(netRevenue),
            icon: <FaWallet className="text-emerald-400" size={18} />,
            iconBg: "bg-emerald-500/10 border-emerald-500/20",
            textColor: "text-emerald-400",
            primarySub: `Gross: ${formatCurrency(grossRevenue)}`,
            secondarySub: `Refunds Deducted: -${formatCurrency(refundAmount)} (${refundedTx} refunds)`,
            badge: `Net Settled (${currencySymbol})`
        }
    ];

    return (
        <section className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 flex flex-col justify-between group"
                    >
                        {/* Top Row: Icon + Title + Badge */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${card.iconBg}`}>
                                        {card.icon}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        {card.title}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                    {card.badge}
                                </span>
                            </div>

                            {/* Main Metric Number */}
                            <div className="my-2">
                                <h3 className={`text-3xl lg:text-4xl font-black tracking-tight ${card.textColor}`}>
                                    {card.value}
                                </h3>
                            </div>
                        </div>

                        {/* Subtext Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs flex flex-col gap-1">
                            <span className="text-slate-300 font-medium">{card.primarySub}</span>
                            <span className="text-slate-500 text-[11px]">{card.secondarySub}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default KPICards;