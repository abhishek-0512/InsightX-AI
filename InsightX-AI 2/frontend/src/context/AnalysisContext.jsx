import { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
    parseDate,
    formatMonthYear,
    sortMonthsChronologically,
    detectDatasetDateFormat,
    defaultDateKeys
} from "../utils/dateParser";
import { computeAnalytics } from "../utils/analyticsEngine";
import {
    CURRENCIES,
    CURRENCY_MAP,
    formatCurrency as formatCurrencyUtil,
    getCurrencySymbol,
    detectDatasetCurrency
} from "../utils/currency";

const AnalysisContext = createContext();

function getRowDate(row, dayFirst = null) {
    if (!row) return null;
    let val = null;

    for (const key of defaultDateKeys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== "" && row[key] !== "NULL") {
            val = row[key];
            break;
        }
        const keyLower = key.toLowerCase();
        if (row[keyLower] !== undefined && row[keyLower] !== null && row[keyLower] !== "" && row[keyLower] !== "NULL") {
            val = row[keyLower];
            break;
        }
    }

    if (val === null) {
        for (const k of Object.keys(row)) {
            const norm = k.toLowerCase().replace(/[\s_-]/g, "");
            if (defaultDateKeys.some((dk) => norm === dk.replace(/[\s_-]/g, ""))) {
                if (row[k] !== undefined && row[k] !== null && row[k] !== "" && row[k] !== "NULL") {
                    val = row[k];
                    break;
                }
            }
        }
    }

    return parseDate(val, dayFirst);
}

export function AnalysisProvider({ children }) {
    const [fullData, setFullData] = useState(null); // stores { analysis, rows, reportPath, fileName }
    const [activePeriod, setActivePeriod] = useState("all"); // "all", "months", "1m", "3m", "6m", "1y", "custom"
    const [selectedMonths, setSelectedMonths] = useState([]); // array of strings e.g. ["Jun 2026", "Jul 2026"]
    const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });

    // Currency selection with localStorage persistence
    const [currency, setCurrencyState] = useState(() => {
        try {
            return localStorage.getItem("insightx_selected_currency") || "INR";
        } catch (e) {
            return "INR";
        }
    });

    const setCurrency = (code) => {
        if (!CURRENCY_MAP[code]) return;
        setCurrencyState(code);
        try {
            localStorage.setItem("insightx_selected_currency", code);
        } catch (e) {
            // Ignore storage errors
        }
    };

    // Extract all raw rows
    const rawRows = useMemo(() => fullData?.rows || [], [fullData]);

    // Detect dataset date format (e.g. DD/MM vs MM/DD)
    const detectedDateFormat = useMemo(() => {
        return detectDatasetDateFormat(rawRows);
    }, [rawRows]);

    const dayFirst = detectedDateFormat.dayFirst;

    // Function to set upload result
    const setResult = (data) => {
        if (!data) {
            setFullData(null);
            setSelectedMonths([]);
            return;
        }

        const rows = data.rows || [];

        // Auto-detect currency from dataset if available
        const detectedCurr = detectDatasetCurrency(rows);
        if (detectedCurr) {
            setCurrency(detectedCurr);
        }

        const initialDateFormat = detectDatasetDateFormat(rows);
        const initialAnalysis = computeAnalytics(rows, initialDateFormat.dayFirst, detectedCurr || currency);

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

    // Extract date metadata
    const dateMeta = useMemo(() => {
        if (!rawRows.length) return { earliestDate: null, latestDate: null, availableMonths: [] };

        const dates = [];
        const monthsSet = new Set();

        rawRows.forEach((row) => {
            const d = getRowDate(row, dayFirst);
            if (d) {
                dates.push(d);
                const m = formatMonthYear(d, dayFirst);
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
    }, [rawRows, dayFirst]);

    // Full cumulative analysis across all rows
    const cumulativeAnalysis = useMemo(() => {
        if (!rawRows.length) return null;
        return computeAnalytics(rawRows, dayFirst, currency);
    }, [rawRows, dayFirst, currency]);

    // Filter rows according to selected date period / custom range / month(s)
    const filteredRows = useMemo(() => {
        if (!rawRows.length) return [];
        if (activePeriod === "all") return rawRows;

        const latest = dateMeta.latestDate ? new Date(dateMeta.latestDate) : new Date();

        return rawRows.filter((row) => {
            const d = getRowDate(row, dayFirst);
            if (!d) return false;

            if (activePeriod === "months") {
                if (!selectedMonths.length) return true;
                const m = formatMonthYear(d, dayFirst);
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
    }, [rawRows, activePeriod, selectedMonths, customRange, dateMeta, dayFirst]);

    // Compute dynamic analysis for active filtered dataset
    const activeAnalysis = useMemo(() => {
        if (!fullData) return null;
        if (activePeriod === "all") {
            return cumulativeAnalysis;
        }
        return computeAnalytics(filteredRows, dayFirst, currency);
    }, [fullData, activePeriod, filteredRows, cumulativeAnalysis, dayFirst, currency]);

    // Derived result payload for components
    const resultPayload = useMemo(() => {
        if (!fullData) return null;
        return {
            ...fullData,
            analysis: activeAnalysis,
            cumulativeAnalysis
        };
    }, [fullData, activeAnalysis, cumulativeAnalysis]);

    // Helper formatCurrency that uses active currency
    const formatCurrency = (val, maxDigits = 2) => {
        return formatCurrencyUtil(val, currency, maxDigits);
    };

    // Month selection helpers:
    const selectSingleMonth = (monthName) => {
        setSelectedMonths([monthName]);
        setActivePeriod("months");
    };

    const toggleMonth = (monthName) => {
        let updated;
        if (activePeriod !== "months") {
            updated = [monthName];
            setActivePeriod("months");
        } else {
            if (selectedMonths.includes(monthName)) {
                updated = selectedMonths.filter((m) => m !== monthName);
                if (updated.length === 0) {
                    setActivePeriod("all");
                    setSelectedMonths([]);
                    return;
                }
            } else {
                updated = sortMonthsChronologically([...selectedMonths, monthName]);
                if (updated.length === dateMeta.availableMonths.length) {
                    setActivePeriod("all");
                    setSelectedMonths([]);
                    return;
                }
            }
        }
        setSelectedMonths(updated);
        setActivePeriod("months");
    };

    const selectCumulative = () => {
        setActivePeriod("all");
        setSelectedMonths([]);
    };

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
                resetFilter,
                currency,
                setCurrency,
                formatCurrency,
                currencySymbol: getCurrencySymbol(currency),
                availableCurrencies: CURRENCIES,
                dayFirst,
                detectedDateFormat: detectedDateFormat.detectedPattern
            }}
        >
            {children}
        </AnalysisContext.Provider>
    );
}

export function useAnalysis() {
    return useContext(AnalysisContext);
}