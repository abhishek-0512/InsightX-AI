import { FaRobot } from "react-icons/fa";
import { useAnalysis } from "../context/AnalysisContext";

function AllInsights() {

    const { result } = useAnalysis();

    const insights = result?.aiSummary || [];

    return (

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">

            <div className="flex items-center gap-3 mb-6">

                <FaRobot
                    size={24}
                    className="text-cyan-400"
                />

                <h2 className="text-2xl font-bold">
                    AI Generated Insights
                </h2>

            </div>

            {!insights.length ? (

                <div className="text-center py-12 text-slate-400">
                    Upload a CSV or Excel file to generate AI insights.
                </div>

            ) : (

                <div className="space-y-4">

                    {insights.map((insight, index) => (

                        <div
                            key={index}
                            className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-cyan-500 transition"
                        >

                            <div className="flex gap-3">

                                <span className="text-cyan-400 font-bold">
                                    #{index + 1}
                                </span>

                                <p className="text-slate-200">
                                    {insight}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}

export default AllInsights;