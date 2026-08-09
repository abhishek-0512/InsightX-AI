import { FaCalendarAlt, FaRedo, FaLayerGroup, FaCheckSquare, FaSquare } from "react-icons/fa";
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
        resetFilter
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

    // Label for the active view
    let activeViewLabel = "Cumulative (All Months)";
    if (activePeriod === "months") {
        if (selectedMonths.length === 1) {
            activeViewLabel = `Single Month: ${selectedMonths[0]}`;
        } else if (selectedMonths.length > 1) {
            activeViewLabel = `Cumulative (${selectedMonths.length} Months): ${selectedMonths.join(" + ")}`;
        }
    } else if (activePeriod === "1m") {
        activeViewLabel = "Last 30 Days";
    } else if (activePeriod === "3m") {
        activeViewLabel = "Last 90 Days";
    } else if (activePeriod === "6m") {
        activeViewLabel = "Last 6 Months";
    } else if (activePeriod === "custom") {
        activeViewLabel = `Custom Range (${customRange.startDate || "Start"} to ${customRange.endDate || "End"})`;
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
            {/* Top Bar Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                        <FaLayerGroup size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Dataset View & Multi-Month Analyzer
                        </h2>
                        <p className="text-xs text-slate-400">
                            Analyze any single month, any combination of multiple months (e.g. May + July), or all months cumulatively
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-950 text-cyan-400 border border-cyan-500/30">
                        {activeViewLabel}
                    </span>

                    {activePeriod !== "all" && (
                        <button
                            onClick={resetFilter}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition border border-slate-700 shadow"
                        >
                            <FaRedo size={11} /> Reset All
                        </button>
                    )}
                </div>
            </div>

            {/* Monthly Selection Row */}
            {availableMonths.length > 0 && (
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <FaCalendarAlt className="text-cyan-400" />
                            <span>Select Month(s) to Analyze Cumulatively:</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                            Tip: Click multiple months to combine them together
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                        {/* All Months Cumulative Button */}
                        <button
                            onClick={selectCumulative}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                                activePeriod === "all"
                                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                        >
                            <FaLayerGroup size={12} />
                            <span>All Months Combined</span>
                        </button>

                        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block"></div>

                        {/* Interactive Month Pills with Multi-Select Toggles */}
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
                                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 border ${
                                        isSingleActive
                                            ? "bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20"
                                            : isSelected && activePeriod === "months"
                                            ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/50"
                                            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                                    }`}
                                >
                                    {isSelected && activePeriod === "months" ? (
                                        <FaCheckSquare className="text-cyan-400" size={13} />
                                    ) : (
                                        <FaSquare className="text-slate-600" size={13} />
                                    )}
                                    <span>{m}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Presets & Custom Range */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
                {/* Presets */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold mr-1">RANGE PRESETS:</span>
                    <button
                        onClick={() => handlePresetClick("1m")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            activePeriod === "1m"
                                ? "bg-slate-800 text-cyan-400 border border-cyan-500/50"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                    >
                        Last 30 Days
                    </button>
                    <button
                        onClick={() => handlePresetClick("3m")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            activePeriod === "3m"
                                ? "bg-slate-800 text-cyan-400 border border-cyan-500/50"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                    >
                        Last 90 Days
                    </button>
                    <button
                        onClick={() => handlePresetClick("6m")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            activePeriod === "6m"
                                ? "bg-slate-800 text-cyan-400 border border-cyan-500/50"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                    >
                        Last 6 Months
                    </button>
                </div>

                {/* Custom Date Inputs & Summary Badge */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400 font-medium">Custom:</span>
                        <input
                            type="date"
                            value={customRange.startDate}
                            onChange={(e) => handleCustomChange("startDate", e.target.value)}
                            className="bg-transparent text-slate-200 text-xs focus:outline-none"
                        />
                        <span className="text-slate-600 text-xs">-</span>
                        <input
                            type="date"
                            value={customRange.endDate}
                            onChange={(e) => handleCustomChange("endDate", e.target.value)}
                            className="bg-transparent text-slate-200 text-xs focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span>
                            Showing <strong className="text-cyan-400">{filteredCount.toLocaleString()}</strong> of{" "}
                            <strong className="text-slate-300">{totalCount.toLocaleString()}</strong> records ({percentage}%)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DateFilterBar;
