import { useState } from "react";
import { FaDownload, FaSpinner, FaFileExcel } from "react-icons/fa";
import toast from "react-hot-toast";
import api, { getBackendOrigin } from "../api/axios";
import { useAnalysis } from "../context/AnalysisContext";

function DownloadButton() {
    const { result, filteredRows } = useAnalysis();
    const [downloading, setDownloading] = useState(false);

    if (!result || !result.rows || !result.rows.length) return null;

    const fileName = result.fileName || result.file || "InsightX_Analytics";
    const reportFileName = result.reportFileName;
    const reportPath = result.reportPath;

    const handleDownload = async () => {
        setDownloading(true);
        const toastId = toast.loading("Preparing Excel Report...");

        try {
            // Approach 1: Export dynamically filtered dataset via API blob stream
            if (filteredRows && filteredRows.length > 0) {
                const response = await api.post(
                    "/report/export",
                    {
                        fileName: fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`,
                        rows: filteredRows,
                        analysis: result.analysis
                    },
                    {
                        responseType: "blob"
                    }
                );

                const blob = new Blob([response.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = reportFileName || `${fileName}_report.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(downloadUrl);

                toast.success("Excel Report downloaded successfully!", { id: toastId });
                return;
            }

            // Approach 2: Direct download from backend static reports
            const backendOrigin = getBackendOrigin();
            const downloadUrl = reportPath?.startsWith("http")
                ? reportPath
                : `${backendOrigin}${reportPath || `/reports/${reportFileName}`}`;

            const a = document.createElement("a");
            a.href = downloadUrl;
            a.target = "_blank";
            a.download = reportFileName || "Analytics_Report.xlsx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            toast.success("Excel Report downloaded successfully!", { id: toastId });
        } catch (err) {
            console.error("Download failed:", err);

            // Fallback: Direct window open if stream failed
            try {
                const backendOrigin = getBackendOrigin();
                const fallbackUrl = `${backendOrigin}/reports/${reportFileName || path.basename(reportPath || "")}`;
                window.open(fallbackUrl, "_blank");
                toast.success("Opening report in new tab...", { id: toastId });
            } catch (fallbackErr) {
                toast.error("Failed to download report. Please try again.", { id: toastId });
            }
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