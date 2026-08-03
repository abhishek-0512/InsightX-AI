import React, { useRef } from "react";
import { useAnalysis } from "../context/AnalysisContext";

export default function UploadBox() {
    const { analyzeFile, loading } = useAnalysis();
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            analyzeFile(file);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl text-center my-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls, .csv"
                className="hidden"
            />
            <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto text-2xl border border-cyan-500/20">
                    📊
                </div>
                <h3 className="text-xl font-bold text-white">Upload Transaction Report</h3>
                <p className="text-slate-400 text-sm">
                    Upload your Excel or CSV transaction record file to generate master analytics instantly.
                </p>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all w-full"
                >
                    {loading ? "Analyzing Data..." : "Select File & Analyze"}
                </button>
            </div>
        </div>
    );
}