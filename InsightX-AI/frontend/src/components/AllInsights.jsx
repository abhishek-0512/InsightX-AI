import React from "react";
import { useAnalysis } from "../context/AnalysisContext";

export default function AllInsights() {
    const { result } = useAnalysis();
    if (!result) return null;

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-md space-y-3 my-6">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                🤖 Business Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-800/50 p-3 rounded-lg text-slate-300">
                    <b>#1 Total Transactions:</b> {result.overview?.totalTransactions || 0}
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg text-slate-300">
                    <b>#2 Total Revenue:</b> ₹{Number(result.revenue?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg text-slate-300">
                    <b>#3 Net Revenue:</b> ₹{Number(result.revenue?.netRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg text-slate-300">
                    <b>#4 Top Payment Mode:</b> {result.topPaymentMode ? result.topPaymentMode[0] : "N/A"}
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg text-slate-300">
                    <b>#5 Top Device:</b> {result.topDevice || "N/A"}
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg text-slate-300">
                    <b>#6 Peak Month:</b> {result.peakMonth || "N/A"}
                </div>
            </div>
        </div>
    );
}