import React from "react";
import { useAnalysis } from "../context/AnalysisContext";

export default function LocationRefundAnalytics() {
    const { result, formatCurrency } = useAnalysis();
    const analysis = result?.analysis;
    if (!analysis) return null;

    const refundedTxns = analysis.payment?.overview?.refundedTransactions || 0;
    const refundAmount = analysis.payment?.revenue?.refundAmount || 0;
    const topLocation = analysis.topLocation || "Main Location";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-md">
                <h4 className="text-lg font-bold text-white mb-4">Location-wise Performance</h4>
                <div className="bg-slate-800/50 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Top Performance Location</span>
                    <span className="text-cyan-400 font-bold">{topLocation}</span>
                </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-md space-y-4">
                <h4 className="text-lg font-bold text-white mb-2">Refunded Transaction Analysis</h4>
                <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total Refunded Transactions</span>
                    <span className="text-xl font-bold text-rose-400">{refundedTxns.toLocaleString()}</span>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total Refund Volume</span>
                    <span className="text-xl font-bold text-rose-400">{formatCurrency(refundAmount)}</span>
                </div>
            </div>
        </div>
    );
}