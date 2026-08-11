const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MONTH_MAP = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11
};

const defaultDateKeys = [
    "created_at",
    "entry_time",
    "date",
    "transaction_date",
    "createdat",
    "payment_date",
    "timestamp",
    "txn_date",
    "order_date",
    "settlement_date",
    "datetime",
    "time"
];

function excelSerialToDate(serial) {
    if (typeof serial !== "number" || isNaN(serial) || serial < 1000 || serial > 150000) {
        return null;
    }
    const utcDays = serial - 25569;
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    const offsetMs = dateInfo.getTimezoneOffset() * 60 * 1000;
    const adjustedDate = new Date(dateInfo.getTime() + offsetMs);
    return isNaN(adjustedDate.getTime()) ? null : adjustedDate;
}

function detectDatasetDateFormat(rows = [], customKeys = defaultDateKeys) {
    if (!rows || !rows.length) {
        return { dayFirst: true, detectedPattern: "auto" };
    }

    let p1Over12Count = 0;
    let p2Over12Count = 0;
    let slashCount = 0;
    let dashCount = 0;

    const p1Values = new Set();
    const p2Values = new Set();

    const sampleSize = Math.min(rows.length, 300);

    for (let i = 0; i < sampleSize; i++) {
        const row = rows[i];
        if (!row) continue;

        let dateStr = "";
        for (const k of customKeys) {
            const val = row[k] || row[k.toLowerCase()] || row[k.toUpperCase()];
            if (val !== undefined && val !== null && val !== "" && val !== "NULL") {
                dateStr = String(val).trim();
                break;
            }
        }

        if (!dateStr) {
            for (const key of Object.keys(row)) {
                const norm = key.toLowerCase().replace(/[\s_-]/g, "");
                if (customKeys.some((ck) => norm === ck.replace(/[\s_-]/g, ""))) {
                    const val = row[key];
                    if (val !== undefined && val !== null && val !== "" && val !== "NULL") {
                        dateStr = String(val).trim();
                        break;
                    }
                }
            }
        }

        if (!dateStr) continue;

        if (/^\d{4}[-/]/.test(dateStr)) continue;

        const match = dateStr.match(/^(\d{1,2})([-/])(\d{1,2})[-/](\d{2,4})/);
        if (match) {
            const p1 = parseInt(match[1], 10);
            const delim = match[2];
            const p2 = parseInt(match[3], 10);

            if (delim === "/") slashCount++;
            if (delim === "-") dashCount++;

            p1Values.add(p1);
            p2Values.add(p2);

            if (p1 > 12 && p2 <= 12) {
                p1Over12Count++;
            } else if (p2 > 12 && p1 <= 12) {
                p2Over12Count++;
            }
        }
    }

    if (p1Over12Count > 0 && p2Over12Count === 0) {
        return { dayFirst: true, detectedPattern: "DD/MM/YYYY" };
    }
    if (p2Over12Count > 0 && p1Over12Count === 0) {
        return { dayFirst: false, detectedPattern: "MM/DD/YYYY" };
    }

    if (p1Values.size === 1 && p2Values.size > 1) {
        return { dayFirst: false, detectedPattern: "MM/DD/YYYY (inferred by month invariance)" };
    }
    if (p2Values.size === 1 && p1Values.size > 1) {
        return { dayFirst: true, detectedPattern: "DD/MM/YYYY (inferred by month invariance)" };
    }

    if (slashCount > dashCount) {
        return { dayFirst: false, detectedPattern: "MM/DD/YYYY" };
    }

    return { dayFirst: true, detectedPattern: "DD/MM/YYYY" };
}

function parseDate(val, dayFirstOverride = null) {
    if (val === undefined || val === null || val === "" || val === "NULL" || val === "null" || val === "undefined") {
        return null;
    }

    if (val instanceof Date) {
        return isNaN(val.getTime()) ? null : val;
    }

    if (typeof val === "number" && val >= 1000 && val <= 150000) {
        const excelDate = excelSerialToDate(val);
        if (excelDate) return excelDate;
    }

    if (typeof val === "string" && /^\d{5}(\.\d+)?$/.test(val.trim())) {
        const numVal = parseFloat(val.trim());
        const excelDate = excelSerialToDate(numVal);
        if (excelDate) return excelDate;
    }

    if (typeof val === "number" || (!isNaN(val) && !isNaN(parseFloat(val)) && String(val).trim().length >= 10 && /^\d+$/.test(String(val).trim()))) {
        const num = Number(val);
        const epochMs = num > 1e11 ? num : num * 1000;
        const d = new Date(epochMs);
        return isNaN(d.getTime()) ? null : d;
    }

    const str = String(val).trim();
    if (!str) return null;

    const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (ymdMatch) {
        const year = parseInt(ymdMatch[1], 10);
        const month = parseInt(ymdMatch[2], 10) - 1;
        const day = parseInt(ymdMatch[3], 10);
        const hh = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 0;
        const mm = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0;
        const ss = ymdMatch[6] ? parseInt(ymdMatch[6], 10) : 0;

        const dateObj = new Date(year, month, day, hh, mm, ss);
        if (!isNaN(dateObj.getTime())) {
            return dateObj;
        }
    }

    const dMmmYMatch = str.match(/^(\d{1,2})[-/\s]([A-Za-z]+)[-/\s](\d{2,4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (dMmmYMatch) {
        const day = parseInt(dMmmYMatch[1], 10);
        const mStr = dMmmYMatch[2].toLowerCase();
        let year = parseInt(dMmmYMatch[3], 10);
        if (year < 100) year += 2000;

        const month = MONTH_MAP[mStr];
        if (month !== undefined) {
            const hh = dMmmYMatch[4] ? parseInt(dMmmYMatch[4], 10) : 0;
            const mm = dMmmYMatch[5] ? parseInt(dMmmYMatch[5], 10) : 0;
            const ss = dMmmYMatch[6] ? parseInt(dMmmYMatch[6], 10) : 0;
            const dateObj = new Date(year, month, day, hh, mm, ss);
            if (!isNaN(dateObj.getTime())) {
                return dateObj;
            }
        }
    }

    const mmmDYMatch = str.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{2,4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (mmmDYMatch) {
        const mStr = mmmDYMatch[1].toLowerCase();
        const day = parseInt(mmmDYMatch[2], 10);
        let year = parseInt(mmmDYMatch[3], 10);
        if (year < 100) year += 2000;

        const month = MONTH_MAP[mStr];
        if (month !== undefined) {
            const hh = mmmDYMatch[4] ? parseInt(mmmDYMatch[4], 10) : 0;
            const mm = mmmDYMatch[5] ? parseInt(mmmDYMatch[5], 10) : 0;
            const ss = mmmDYMatch[6] ? parseInt(mmmDYMatch[6], 10) : 0;
            const dateObj = new Date(year, month, day, hh, mm, ss);
            if (!isNaN(dateObj.getTime())) {
                return dateObj;
            }
        }
    }

    const dmyMatch = str.match(/^(\d{1,2})([-/.])(\d{1,2})[-/.](\d{2,4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
    if (dmyMatch) {
        const p1 = parseInt(dmyMatch[1], 10);
        const delim = dmyMatch[2];
        const p2 = parseInt(dmyMatch[3], 10);
        let year = parseInt(dmyMatch[4], 10);
        if (year < 100) year += 2000;

        let day, month;

        if (p1 > 12 && p2 <= 12) {
            day = p1;
            month = p2 - 1;
        } else if (p2 > 12 && p1 <= 12) {
            month = p1 - 1;
            day = p2;
        } else if (dayFirstOverride === true) {
            day = p1;
            month = p2 - 1;
        } else if (dayFirstOverride === false) {
            month = p1 - 1;
            day = p2;
        } else {
            if (delim === "/") {
                month = p1 - 1;
                day = p2;
            } else {
                day = p1;
                month = p2 - 1;
            }
        }

        const hh = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
        const mm = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
        const ss = dmyMatch[7] ? parseInt(dmyMatch[7], 10) : 0;

        const dateObj = new Date(year, month, day, hh, mm, ss);
        if (!isNaN(dateObj.getTime())) {
            return dateObj;
        }
    }

    const nativeDate = new Date(str);
    if (!isNaN(nativeDate.getTime())) {
        return nativeDate;
    }

    return null;
}

function formatMonthYear(dateVal, dayFirst = null) {
    const d = parseDate(dateVal, dayFirst);
    if (!d) return null;
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateISO(dateVal, dayFirst = null) {
    const d = parseDate(dateVal, dayFirst);
    if (!d) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function sortMonthsChronologically(months = []) {
    return [...months].sort((a, b) => {
        if (!a || !b) return 0;
        const [mA, yA] = a.trim().split(/\s+/);
        const [mB, yB] = b.trim().split(/\s+/);
        const yearA = parseInt(yA, 10) || 0;
        const yearB = parseInt(yB, 10) || 0;
        if (yearA !== yearB) return yearA - yearB;
        const idxA = MONTH_NAMES.indexOf(mA);
        const idxB = MONTH_NAMES.indexOf(mB);
        return idxA - idxB;
    });
}

module.exports = {
    parseDate,
    formatMonthYear,
    formatDateISO,
    sortMonthsChronologically,
    detectDatasetDateFormat,
    MONTH_NAMES
};
