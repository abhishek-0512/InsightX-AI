import React from "react";
import { useAnalysis } from "../context/AnalysisContext";

export default function KPICards() {
    const { result } = useAnalysis();
    if (!result) return null;

    const totalTxns = result.overview?.totalTransactions || 0;
    const successRate = result.performance?.successRate || 0;
    const netRevenue = result.revenue?.netRevenue || 0;
    const refundRate = result.performance?.refundRate || 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
                <p className="text-slate-400 text-sm font-medium">Total Transactions</p>
                <h3 className="text-3xl font-extrabold text-cyan-400 mt-2">{Number(totalTxns).toLocaleString()}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
                <p className="text-slate-400 text-sm font-medium">Success Rate</p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{Number(successRate).toFixed(2)}%</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
                <p className="text-slate-400 text-sm font-medium">Net Revenue</p>
                <h3 className="text-3xl font-extrabold text-blue-400 mt-2">₹{Number(netRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
                <p className="text-slate-400 text-sm font-medium">Refund Rate</p>
                <h3 className="text-3xl font-extrabold text-rose-400 mt-2">{Number(refundRate).toFixed(2)}%</h3>
            </div>
        </div>
    );
}