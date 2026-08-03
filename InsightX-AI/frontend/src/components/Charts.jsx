import React from "react";
import { useAnalysis } from "../context/AnalysisContext";

export default function Charts() {
    const { result } = useAnalysis();
    if (!result) return null;

    const paymentModes = result.paymentModes || {};

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-md my-6">
            <h4 className="text-lg font-bold text-white mb-4">Payment Mode Distribution</h4>
            {Object.keys(paymentModes).length > 0 ? (
                <div className="space-y-3">
                    {Object.entries(paymentModes).map(([mode, count]) => (
                        <div key={mode} className="flex justify-between items-center text-sm bg-slate-800/50 p-3 rounded-lg">
                            <span className="capitalize font-medium text-slate-300">{mode}</span>
                            <span className="font-bold text-cyan-400">{count} Transactions</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 text-center py-8">No payment mode data available</p>
            )}
        </div>
    );
}