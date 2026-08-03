import { useAnalysis } from "../context/AnalysisContext";

function KPICards() {

    const { result } = useAnalysis();

    const analysis = result?.analysis;

    const cards = [
        {
            title: "Total Transactions",
            value: analysis?.payment?.overview?.totalTransactions ?? "-"
        },
        {
            title: "Success Rate",
            value:
                analysis?.payment?.successRate !== undefined
                    ? `${analysis.payment.successRate}%`
                    : "-"
        },
        {
            title: "Net Revenue",
            value: analysis?.payment?.revenue?.netAmount ?? "-"
        },
        {
            title: "Refund Rate",
            value:
                analysis?.payment?.refundRate !== undefined
                    ? `${analysis.payment.refundRate}%`
                    : "-"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {cards.map((card) => (

                <div
                    key={card.title}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500 transition"
                >
                    <p className="text-slate-400 text-sm">
                        {card.title}
                    </p>

                    <h2 className="text-3xl font-bold mt-4 text-cyan-400">
                        {card.value}
                    </h2>

                </div>

            ))}

        </div>
    );
}

export default KPICards;