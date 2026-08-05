import React from "react";
import { useAnalysis } from "../context/AnalysisContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://insightx-ai.onrender.com";

export default function DownloadButton() {
    const { result } = useAnalysis();
    if (!result) return null;

    const handleDownload = () => {
        window.open(`${API_BASE_URL}/api/analytics/export`, "_blank");
    };

    return (
        <div className="flex justify-end my-6">
            <button
                onClick={handleDownload}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
            >
                Download Executive Report (XLSX)
            </button>
        </div>
    );
}