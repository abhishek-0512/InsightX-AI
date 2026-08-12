import React from "react";
import { useAnalysis } from "../context/AnalysisContext";

export default function DeviceAnalytics() {
    const { result } = useAnalysis();
    const analysis = result?.analysis;
    if (!analysis) return null;

    const platformMap = analysis.platform || {};
    const topEntry = Object.entries(platformMap).sort((a, b) => b[1] - a[1])[0];
    const topDevice = topEntry ? `${topEntry[0]} (${topEntry[1].toLocaleString()} txns)` : "Unknown";

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-md my-6">
            <h4 className="text-lg font-bold text-white mb-4">Device & Platform Breakdown</h4>
            <div className="bg-slate-800/50 p-4 rounded-lg flex justify-between items-center">
                <span className="text-slate-300 font-medium">Dominant Device / Platform Category</span>
                <span className="text-cyan-400 font-bold">{topDevice}</span>
            </div>
        </div>
    );
}