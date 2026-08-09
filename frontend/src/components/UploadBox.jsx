import { useRef, useState } from "react";
import { FaCloudUploadAlt, FaFileCsv, FaFileExcel, FaCheckCircle, FaSpinner, FaExchangeAlt } from "react-icons/fa";
import toast from "react-hot-toast";

import api from "../api/axios";
import { useAnalysis } from "../context/AnalysisContext";

function UploadBox() {
    const { setResult, result } = useAnalysis();
    const inputRef = useRef();

    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [fileStats, setFileStats] = useState(null);

    const processFile = async (file) => {
        if (!file) return;

        const validExts = [".csv", ".xls", ".xlsx"];
        const lowerName = file.name.toLowerCase();
        const isValid = validExts.some((ext) => lowerName.endsWith(ext));

        if (!isValid) {
            toast.error("Please upload a valid CSV, XLS, or XLSX file.");
            return;
        }

        setUploadedFileName(file.name);
        setFileStats({
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            type: lowerName.endsWith(".csv") ? "CSV Document" : "Excel Spreadsheet"
        });

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const toastId = toast.loading("Analyzing transaction dataset...");

            const { data } = await api.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setResult(data);
            toast.success(data.message || "Dataset analyzed successfully!", { id: toastId });
        } catch (err) {
            console.error("Upload error:", err);
            toast.error(err.response?.data?.message || "Upload Failed. Please verify your file format.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const hasData = result && result.rows && result.rows.length > 0;

    return (
        <section className="mb-10">
            {/* Header Title */}
            <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                    Upload & Analyze <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Transaction Reports</span>
                </h2>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    Upload single-month or multi-month payment logs. Our engine automatically reconciles revenue, validates refunds, and builds full monthly breakdowns.
                </p>
            </div>

            {/* Upload Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
                className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer p-8 sm:p-12 text-center group ${
                    isDragging
                        ? "border-cyan-400 bg-cyan-950/30 scale-[1.01] shadow-2xl shadow-cyan-500/20"
                        : hasData
                        ? "border-slate-700 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-900/80"
                        : "border-slate-700 bg-gradient-to-b from-slate-900/90 to-slate-950 hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-500/10"
                }`}
            >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center justify-center max-w-lg mx-auto">
                    {/* Animated Icon */}
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 transition-transform duration-300 shadow-xl ${
                        hasData
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:scale-110"
                            : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 group-hover:bg-cyan-500/20"
                    }`}>
                        {loading ? (
                            <FaSpinner className="animate-spin" size={36} />
                        ) : hasData ? (
                            <FaCheckCircle size={36} className="text-emerald-400" />
                        ) : (
                            <FaCloudUploadAlt size={40} className="text-cyan-400" />
                        )}
                    </div>

                    {/* Instructions */}
                    {loading ? (
                        <>
                            <h3 className="text-xl font-bold text-white mb-2">Analyzing Dataset...</h3>
                            <p className="text-sm text-cyan-400 animate-pulse">
                                Reconciling transactions, parsing dates, and computing monthly analytics
                            </p>
                        </>
                    ) : hasData ? (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <h3 className="text-xl font-bold text-white">Active Dataset Loaded</h3>
                            </div>

                            {/* Active File Pill */}
                            <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 my-2">
                                {uploadedFileName.toLowerCase().endsWith(".csv") ? (
                                    <FaFileCsv className="text-cyan-400" size={18} />
                                ) : (
                                    <FaFileExcel className="text-emerald-400" size={18} />
                                )}
                                <span className="font-bold text-slate-200 text-sm">{uploadedFileName || result.fileName || "Uploaded File"}</span>
                                {fileStats && (
                                    <span className="text-xs text-slate-500 font-medium">({fileStats.size})</span>
                                )}
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ml-1">
                                    {result.rows.length.toLocaleString()} Records
                                </span>
                            </div>

                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 hover:text-cyan-300 transition">
                                <FaExchangeAlt size={11} /> Click or drag to upload a different file
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Choose a file or drag & drop here
                            </h3>
                            <p className="text-sm text-slate-400 mb-6">
                                Upload transaction dumps from Razorpay, PineLabs, Paytm, Stripe, or any custom merchant CSV
                            </p>

                            <button
                                type="button"
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-3.5 rounded-2xl shadow-xl shadow-cyan-500/25 transition transform group-hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 text-sm cursor-pointer"
                            >
                                <FaCloudUploadAlt size={18} />
                                <span>Browse Computer</span>
                            </button>
                        </>
                    )}

                    {/* Supported Formats Footer */}
                    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-500 font-medium">
                        <span>Supported Formats:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">.CSV</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">.XLS</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">.XLSX</span>
                    </div>
                </div>

                {/* Hidden File Input */}
                <input
                    hidden
                    ref={inputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileInput}
                />
            </div>
        </section>
    );
}

export default UploadBox;