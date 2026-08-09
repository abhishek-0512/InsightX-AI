import { useAnalysis } from "../context/AnalysisContext";

function KPICards() {
    const { result, activePeriod, selectedMonths } = useAnalysis();

    const analysis = result?.analysis;
    if (!analysis) return null;

    const totalTx = analysis?.payment?.overview?.totalTransactions;
    const successTx = analysis?.payment?.overview?.successfulTransactions || 0;
    const failedTx = analysis?.payment?.overview?.failedTransactions || 0;
    const refundedTx = analysis?.payment?.overview?.refundedTransactions || 0;

    const successRate = analysis?.payment?.successRate;
    const refundRate = analysis?.payment?.refundRate;

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

    let periodLabel = "All Months (Cumulative)";
    if (activePeriod === "months") {
        if (selectedMonths.length === 1) {
            periodLabel = `Month: ${selectedMonths[0]}`;
        } else if (selectedMonths.length > 1) {
            periodLabel = `${selectedMonths.length} Months Cumulative`;
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
            value: totalTx !== undefined ? totalTx.toLocaleString() : "-",
            sub: `${successTx.toLocaleString()} Successful • ${failedTx.toLocaleString()} Failed`,
            badge: periodLabel,
            color: "text-cyan-400"
        },
        {
            title: "Success Rate",
            value: successRate !== undefined ? `${successRate}%` : "-",
            sub: `${successTx.toLocaleString()} successful sales`,
            badge: `${failedTx.toLocaleString()} failed`,
            color: "text-emerald-400"
        },
        {
            title: "Net Revenue",
            value: formatCurrency(netRevenue),
            sub: `Gross: ${formatCurrency(grossRevenue)}`,
            badge: "Gross - Refunds",
            color: "text-cyan-400"
        },
        {
            title: "Successful Refunds",
            value: refundedTx !== undefined ? refundedTx.toLocaleString() : "-",
            sub: `Amount: ${formatCurrency(refundAmount)} (${refundRate || 0}% rate)`,
            badge: "Successful Only",
            color: "text-amber-400"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition shadow-lg relative overflow-hidden group"
                >
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            {card.title}
                        </p>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {card.badge}
                        </span>
                    </div>

                    <h2 className={`text-3xl font-extrabold mt-2 ${card.color}`}>
                        {card.value}
                    </h2>

                    <p className="text-xs text-slate-400 mt-2 font-medium">
                        {card.sub}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default KPICards;