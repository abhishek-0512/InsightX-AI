import { FaRobot, FaLightbulb } from "react-icons/fa";
import { useAnalysis } from "../context/AnalysisContext";

function AllInsights() {
    const { result } = useAnalysis();
    const insights = result?.analysis?.aiSummary || [];

    if (!result || !result.rows || !result.rows.length) return null;

    return (
        <section className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-6 border-b border-slate-800 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                    <FaRobot size={22} />
                </div>
                <div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        AI Executive Insights
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            Automated Intelligence
                        </span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                        Instant executive takeaways and anomalies detected across your transaction logs
                    </p>
                </div>
            </div>

            {/* Insights List */}
            <div className="grid gap-3.5">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className="bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-4 sm:p-5 transition duration-200 shadow-sm flex items-start gap-4 group"
                    >
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                            #{index + 1}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-200 leading-relaxed font-medium">
                                {insight}
                            </p>
                        </div>
                        <FaLightbulb className="text-slate-600 group-hover:text-amber-400 transition shrink-0 mt-1" size={14} />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default AllInsights;