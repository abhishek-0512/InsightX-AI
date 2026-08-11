import { FaCalendarAlt, FaRedo, FaLayerGroup, FaCheckSquare, FaSquare, FaCheck } from "react-icons/fa";
import { useAnalysis } from "../context/AnalysisContext";

function DateFilterBar() {
    const {
        result,
        rawRows,
        filteredRows,
        activePeriod,
        setActivePeriod,
        selectedMonths,
        toggleMonth,
        selectCumulative,
        customRange,
        setCustomRange,
        dateMeta,
        resetFilter,
        detectedDateFormat
    } = useAnalysis();

    if (!result || !rawRows.length) return null;

    const totalCount = rawRows.length;
    const filteredCount = filteredRows.length;
    const percentage = totalCount ? Math.round((filteredCount / totalCount) * 100) : 0;
    const availableMonths = dateMeta.availableMonths || [];

    const handlePresetClick = (period) => {
        setActivePeriod(period);
    };

    const handleCustomChange = (field, value) => {
        setCustomRange((prev) => ({
            ...prev,
            [field]: value
        }));
        setActivePeriod("custom");
    };

    let activeViewLabel = "Cumulative (All Months)";
    if (activePeriod === "months") {
        if (selectedMonths.length === 1) {
            activeViewLabel = `Single Month: ${selectedMonths[0]}`;
        } else if (selectedMonths.length > 1) {
            activeViewLabel = `${selectedMonths.length} Months: ${selectedMonths.join(" + ")}`;
        }
    } else if (activePeriod === "1m") {
        activeViewLabel = "Last 30 Days";
    } else if (activePeriod === "3m") {
        activeViewLabel = "Last 90 Days";
    } else if (activePeriod === "6m") {
        activeViewLabel = "Last 6 Months";
    } else if (activePeriod === "custom") {
        activeViewLabel = `Custom Range: ${customRange.startDate || "Start"} to ${customRange.endDate || "End"}`;
    }

    return (
        <section className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                        <FaLayerGroup size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-extrabold text-white tracking-tight">
                                Dataset View & Multi-Month Analyzer
                            </h2>
                            {detectedDateFormat && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                                    <FaCheck size={9} /> {detectedDateFormat}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                            Select any single month, combine multiple months together, or view full cumulative analytics
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300">
                        {activeViewLabel}
                    </div>

                    {activePeriod !== "all" && (
                        <button
                            onClick={resetFilter}
                            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition border border-slate-700 shadow cursor-pointer"
                        >
                            <FaRedo size={11} /> Reset All
                        </button>
                    )}
                </div>
            </div>

            {/* Month Selection Buttons */}
            {availableMonths.length > 0 && (
                <div className="py-6 border-b border-slate-800/80">
                    <div className="flex items-center justify-between mb-3.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                            <FaCalendarAlt className="text-cyan-400" />
                            <span>Select Month(s) to Analyze Cumulatively:</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                            Tip: Check multiple months to combine them together
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* All Months Button */}
                        <button
                            onClick={selectCumulative}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                activePeriod === "all"
                                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/30"
                                    : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            <FaLayerGroup size={13} />
                            <span>All Months Combined</span>
                        </button>

                        {/* Month Pills */}
                        {availableMonths.map((m) => {
                            const isSelected =
                                activePeriod === "all" ||
                                (activePeriod === "months" && selectedMonths.includes(m));

                            const isSingleActive =
                                activePeriod === "months" &&
                                selectedMonths.length === 1 &&
                                selectedMonths[0] === m;

                            return (
                                <button
                                    key={m}
                                    onClick={() => toggleMonth(m)}
                                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 border cursor-pointer ${
                                        isSingleActive
                                            ? "bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-300/30"
                                            : isSelected && activePeriod === "months"
                                            ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-md shadow-cyan-500/10"
                                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700 hover:bg-slate-900"
                                    }`}
                                >
                                    {isSelected && activePeriod === "months" ? (
                                        <FaCheckSquare className="text-cyan-400" size={14} />
                                    ) : (
                                        <FaSquare className="text-slate-600" size={14} />
                                    )}
                                    <span>{m}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Range Presets & Custom Range */}
            <div className="pt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Presets */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Presets:</span>
                    <button
                        onClick={() => handlePresetClick("1m")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                            activePeriod === "1m"
                                ? "bg-slate-800 text-cyan-400 border-cyan-500/50 shadow"
                                : "bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-900"
                        }`}
                    >
                        Last 30 Days
                    </button>
                    <button
                        onClick={() => handlePresetClick("3m")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                            activePeriod === "3m"
                                ? "bg-slate-800 text-cyan-400 border-cyan-500/50 shadow"
                                : "bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-900"
                        }`}
                    >
                        Last 90 Days
                    </button>
                    <button
                        onClick={() => handlePresetClick("6m")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                            activePeriod === "6m"
                                ? "bg-slate-800 text-cyan-400 border-cyan-500/50 shadow"
                                : "bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-900"
                        }`}
                    >
                        Last 6 Months
                    </button>
                </div>

                {/* Custom Date Inputs & Summary Count */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
                        <span className="text-xs text-slate-400 font-semibold">Custom:</span>
                        <input
                            type="date"
                            value={customRange.startDate}
                            onChange={(e) => handleCustomChange("startDate", e.target.value)}
                            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                        />
                        <span className="text-slate-600 text-xs font-bold">to</span>
                        <input
                            type="date"
                            value={customRange.endDate}
                            onChange={(e) => handleCustomChange("endDate", e.target.value)}
                            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span>
                            Showing <strong className="text-cyan-400">{filteredCount.toLocaleString()}</strong> of{" "}
                            <strong className="text-slate-300">{totalCount.toLocaleString()}</strong> records ({percentage}%)
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DateFilterBar;
