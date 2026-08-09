import { FaExchangeAlt, FaCheckCircle, FaWallet, FaUndoAlt } from "react-icons/fa";
import { useAnalysis } from "../context/AnalysisContext";

function KPICards() {
    const { result, activePeriod, selectedMonths } = useAnalysis();

    const analysis = result?.analysis;
    if (!analysis) return null;

    const totalTx = analysis?.payment?.overview?.totalTransactions || 0;
    const successTx = analysis?.payment?.overview?.successfulTransactions || 0;
    const failedTx = analysis?.payment?.overview?.failedTransactions || 0;
    const refundedTx = analysis?.payment?.overview?.refundedTransactions || 0;

    const successRate = analysis?.payment?.successRate || 0;
    const refundRate = analysis?.payment?.refundRate || 0;

    const grossRevenue = analysis?.payment?.revenue?.totalAmount || 0;
    const refundAmount = analysis?.payment?.revenue?.refundAmount || 0;
    const netRevenue =
        analysis?.payment?.revenue?.netAmount !== undefined
            ? analysis.payment.revenue.netAmount
            : Math.max(0, grossRevenue - refundAmount);

    const formatCurrency = (val) => {
        if (val === undefined || val === null || isNaN(val)) return "₹0";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(val);
    };

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
            primarySub: `${successTx.toLocaleString()} Successful`,
            secondarySub: `${failedTx.toLocaleString()} Failed`,
            badge: periodLabel
        },
        {
            title: "Success Rate",
            value: `${successRate}%`,
            icon: <FaCheckCircle className="text-emerald-400" size={18} />,
            iconBg: "bg-emerald-500/10 border-emerald-500/20",
            textColor: "text-emerald-400",
            primarySub: `${successTx.toLocaleString()} Completed`,
            secondarySub: `${((100 - successRate) || 0).toFixed(1)}% drop-off`,
            badge: "Completed"
        },
        {
            title: "Net Realized Revenue",
            value: formatCurrency(netRevenue),
            icon: <FaWallet className="text-cyan-400" size={18} />,
            iconBg: "bg-cyan-500/10 border-cyan-500/20",
            textColor: "text-cyan-400",
            primarySub: `Gross: ${formatCurrency(grossRevenue)}`,
            secondarySub: `Refunds: ${formatCurrency(refundAmount)}`,
            badge: "Gross - Refunds"
        },
        {
            title: "Successful Refunds",
            value: refundedTx.toLocaleString(),
            icon: <FaUndoAlt className="text-amber-400" size={18} />,
            iconBg: "bg-amber-500/10 border-amber-500/20",
            textColor: "text-amber-400",
            primarySub: `Amount: ${formatCurrency(refundAmount)}`,
            secondarySub: `${refundRate}% refund rate`,
            badge: "Successful Only"
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
                            </div>

                            {/* Main Metric Number */}
                            <div className="my-2">
                                <h3 className={`text-3xl lg:text-4xl font-black tracking-tight ${card.textColor}`}>
                                    {card.value}
                                </h3>
                            </div>
                        </div>

                        {/* Bottom Subtext Row */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-300">
                                {card.primarySub}
                            </span>
                            <span className="text-slate-400 font-medium">
                                {card.secondarySub}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default KPICards;