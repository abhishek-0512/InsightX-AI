import { useState } from "react";
import { FaDownload, FaSpinner, FaFileExcel } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAnalysis } from "../context/AnalysisContext";
import { exportExcelInBrowser } from "../utils/excelExporter";
import api from "../api/axios";

function DownloadButton() {
    const { result, filteredRows, currency } = useAnalysis();
    const [downloading, setDownloading] = useState(false);

    if (!result || !result.rows || !result.rows.length) return null;

    const fileName = result.fileName || "InsightX_Analytics";

    const handleDownload = async () => {
        setDownloading(true);
        const toastId = toast.loading("Generating Excel Report...");

        try {
            // Try backend export first if online
            try {
                const response = await api.post(
                    "/report/export",
                    {
                        fileName: fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`,
                        rows: filteredRows || result.rows,
                        analysis: result.analysis,
                        currency: currency || "INR"
                    },
                    {
                        responseType: "blob",
                        timeout: 5000
                    }
                );

                const blob = new Blob([response.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = `${fileName}_report.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(downloadUrl);

                toast.success("Excel Report downloaded successfully!", { id: toastId });
                return;
            } catch (apiErr) {
                console.log("Backend offline/sleeping, using browser Excel generator:", apiErr.message);
            }

            // Client-side instant Excel generator fallback (100% reliable on Vercel)
            await exportExcelInBrowser(filteredRows || result.rows, result.analysis, `${fileName}_report.xlsx`, currency || "INR");
            toast.success("Excel Report downloaded successfully!", { id: toastId });
        } catch (err) {
            console.error("Download failed:", err);
            toast.error("Failed to generate report. Please try again.", { id: toastId });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center mt-10 mb-14">
            <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
                {downloading ? (
                    <>
                        <FaSpinner className="animate-spin" size={20} />
                        <span>Generating Excel Report...</span>
                    </>
                ) : (
                    <>
                        <FaFileExcel size={22} className="text-emerald-200" />
                        <span className="text-base">Download Complete Excel Report (.xlsx)</span>
                        <FaDownload size={16} className="text-emerald-200 ml-1" />
                    </>
                )}
            </button>
            <p className="text-xs text-slate-400 mt-2.5">
                Includes Executive Summary, Monthly Breakdown, Revenue & Payment Channels
            </p>
        </div>
    );
}

export default DownloadButton;