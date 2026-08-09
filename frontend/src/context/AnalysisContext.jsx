import { createContext, useContext, useState, useMemo } from "react";
import {
    parseDate,
    formatMonthYear,
    sortMonthsChronologically
} from "../utils/dateParser";
import { computeAnalytics } from "../utils/analyticsEngine";

const AnalysisContext = createContext();

function getRowDate(row) {
    if (!row) return null;
    const val =
        row.created_at ||
        row.entry_time ||
        row.date ||
        row.transaction_date ||
        row.createdat ||
        row.payment_date ||
        row.timestamp ||
        row.createdAt ||
        row.entryTime ||
        row.Date;

    return parseDate(val);
}

export function AnalysisProvider({ children }) {
    const [fullData, setFullData] = useState(null); // stores { analysis, rows, reportPath, fileName }
    const [activePeriod, setActivePeriod] = useState("all"); // "all", "months", "1m", "3m", "6m", "1y", "custom"
    const [selectedMonths, setSelectedMonths] = useState([]); // array of strings e.g. ["Jun 2026", "Jul 2026"]
    const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });

    // Function to set upload result
    const setResult = (data) => {
        if (!data) {
            setFullData(null);
            setSelectedMonths([]);
            return;
        }

        const rows = data.rows || [];
        const initialAnalysis = computeAnalytics(rows);

        const payload = {
            ...data,
            analysis: initialAnalysis,
            rows
        };

        setFullData(payload);
        setActivePeriod("all");
        setSelectedMonths([]);
        setCustomRange({ startDate: "", endDate: "" });
    };

    // Extract all raw rows
    const rawRows = useMemo(() => fullData?.rows || [], [fullData]);

    // Extract date metadata
    const dateMeta = useMemo(() => {
        if (!rawRows.length) return { earliestDate: null, latestDate: null, availableMonths: [] };

        const dates = [];
        const monthsSet = new Set();

        rawRows.forEach((row) => {
            const d = getRowDate(row);
            if (d) {
                dates.push(d);
                const m = formatMonthYear(d);
                if (m) monthsSet.add(m);
            }
        });

        if (!dates.length) return { earliestDate: null, latestDate: null, availableMonths: [] };

        dates.sort((a, b) => a - b);
        const sortedMonths = sortMonthsChronologically(Array.from(monthsSet));

        return {
            earliestDate: dates[0],
            latestDate: dates[dates.length - 1],
            availableMonths: sortedMonths
        };
    }, [rawRows]);

    // Full cumulative analysis across all rows
    const cumulativeAnalysis = useMemo(() => {
        if (!rawRows.length) return null;
        return computeAnalytics(rawRows);
    }, [rawRows]);

    // Filter rows according to selected date period / custom range / month(s)
    const filteredRows = useMemo(() => {
        if (!rawRows.length) return [];
        if (activePeriod === "all") return rawRows;

        const latest = dateMeta.latestDate ? new Date(dateMeta.latestDate) : new Date();

        return rawRows.filter((row) => {
            const d = getRowDate(row);
            if (!d) return false;

            if (activePeriod === "months") {
                if (!selectedMonths.length) return true;
                const m = formatMonthYear(d);
                return selectedMonths.includes(m);
            }

            if (activePeriod === "1m") {
                const cutoff = new Date(latest);
                cutoff.setDate(cutoff.getDate() - 30);
                return d >= cutoff && d <= latest;
            }

            if (activePeriod === "3m") {
                const cutoff = new Date(latest);
                cutoff.setDate(cutoff.getDate() - 90);
                return d >= cutoff && d <= latest;
            }

            if (activePeriod === "6m") {
                const cutoff = new Date(latest);
                cutoff.setDate(cutoff.getDate() - 180);
                return d >= cutoff && d <= latest;
            }

            if (activePeriod === "1y") {
                const cutoff = new Date(latest);
                cutoff.setDate(cutoff.getDate() - 365);
                return d >= cutoff && d <= latest;
            }

            if (activePeriod === "custom") {
                const start = customRange.startDate ? new Date(customRange.startDate) : null;
                const end = customRange.endDate ? new Date(customRange.endDate + "T23:59:59") : null;
                if (start && d < start) return false;
                if (end && d > end) return false;
                return true;
            }

            return true;
        });
    }, [rawRows, activePeriod, selectedMonths, customRange, dateMeta]);

    // Compute dynamic analysis for active filtered dataset
    const activeAnalysis = useMemo(() => {
        if (!fullData) return null;
        if (activePeriod === "all") {
            return cumulativeAnalysis;
        }
        return computeAnalytics(filteredRows);
    }, [fullData, activePeriod, filteredRows, cumulativeAnalysis]);

    // Derived result payload for components
    const resultPayload = useMemo(() => {
        if (!fullData) return null;
        return {
            ...fullData,
            analysis: activeAnalysis,
            cumulativeAnalysis
        };
    }, [fullData, activeAnalysis, cumulativeAnalysis]);

    // Month selection helpers:
    // 1. Select single month
    const selectSingleMonth = (monthName) => {
        setSelectedMonths([monthName]);
        setActivePeriod("months");
    };

    // 2. Toggle month in multi-month selection
    const toggleMonth = (monthName) => {
        let updated;
        if (activePeriod !== "months") {
            // Start multi-month selection with this month
            updated = [monthName];
            setActivePeriod("months");
        } else {
            if (selectedMonths.includes(monthName)) {
                updated = selectedMonths.filter((m) => m !== monthName);
                if (updated.length === 0) {
                    // Reset to all if none selected
                    setActivePeriod("all");
                    setSelectedMonths([]);
                    return;
                }
            } else {
                updated = sortMonthsChronologically([...selectedMonths, monthName]);
                if (updated.length === dateMeta.availableMonths.length) {
                    // If all months are checked, set to all
                    setActivePeriod("all");
                    setSelectedMonths([]);
                    return;
                }
            }
        }
        setSelectedMonths(updated);
        setActivePeriod("months");
    };

    // 3. Select all / cumulative
    const selectCumulative = () => {
        setActivePeriod("all");
        setSelectedMonths([]);
    };

    // 4. Select specific combination of months
    const selectMultipleMonths = (monthsArr) => {
        const sorted = sortMonthsChronologically(monthsArr);
        if (!sorted.length || sorted.length === dateMeta.availableMonths.length) {
            selectCumulative();
        } else {
            setSelectedMonths(sorted);
            setActivePeriod("months");
        }
    };

    const resetFilter = () => {
        setActivePeriod("all");
        setSelectedMonths([]);
        setCustomRange({ startDate: "", endDate: "" });
    };

    return (
        <AnalysisContext.Provider
            value={{
                result: resultPayload,
                cumulativeAnalysis,
                setResult,
                setAnalysis: setResult,
                rawRows,
                filteredRows,
                activePeriod,
                setActivePeriod,
                selectedMonths,
                setSelectedMonths,
                selectSingleMonth,
                toggleMonth,
                selectCumulative,
                selectMultipleMonths,
                customRange,
                setCustomRange,
                dateMeta,
                resetFilter
            }}
        >
            {children}
        </AnalysisContext.Provider>
    );
}

export function useAnalysis() {
    return useContext(AnalysisContext);
}