export const MONTH_NAMES = [
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

export const defaultDateKeys = [
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

/**
 * Converts an Excel numeric serial number into a JavaScript Date object.
 * (Excel's base date is Dec 30, 1899, which corresponds to serial 25569 on Unix epoch 1970-01-01).
 * @param {number} serial 
 * @returns {Date|null}
 */
export function excelSerialToDate(serial) {
    if (typeof serial !== "number" || isNaN(serial) || serial < 1000 || serial > 150000) {
        return null;
    }
    // Unix epoch in milliseconds
    const utcDays = serial - 25569;
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);

    // Adjust for local timezone offset so date parts are preserved
    const offsetMs = dateInfo.getTimezoneOffset() * 60 * 1000;
    const adjustedDate = new Date(dateInfo.getTime() + offsetMs);
    return isNaN(adjustedDate.getTime()) ? null : adjustedDate;
}

/**
 * Scans rows in a dataset to intelligently detect the date format convention.
 * Returns { dayFirst: boolean } ('DD/MM/YYYY' if true, 'MM/DD/YYYY' if false)
 * @param {Array<Object>} rows 
 * @param {Array<string>} customKeys 
 * @returns {{ dayFirst: boolean, detectedPattern: string }}
 */
export function detectDatasetDateFormat(rows = [], customKeys = defaultDateKeys) {
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
            // Check all keys in row
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

        // Skip ISO format YYYY-MM-DD
        if (/^\d{4}[-/]/.test(dateStr)) continue;

        // Match 2-part or 3-part day/month formats: A-B-YYYY or A/B/YYYY
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
                p1Over12Count++; // Definitely DD/MM
            } else if (p2 > 12 && p1 <= 12) {
                p2Over12Count++; // Definitely MM/DD
            }
        }
    }

    // 1. Definite proof from values > 12
    if (p1Over12Count > 0 && p2Over12Count === 0) {
        return { dayFirst: true, detectedPattern: "DD/MM/YYYY" };
    }
    if (p2Over12Count > 0 && p1Over12Count === 0) {
        return { dayFirst: false, detectedPattern: "MM/DD/YYYY" };
    }

    // 2. Invariance heuristic:
    // In a single-month dataset, the month stays constant while days vary!
    // E.g. If P1 is always 7 (1 unique value) and P2 varies 1..30 (multiple unique values),
    // P1 is the MONTH and P2 is the DAY -> MM/DD/YYYY!
    if (p1Values.size === 1 && p2Values.size > 1) {
        return { dayFirst: false, detectedPattern: "MM/DD/YYYY (inferred by month invariance)" };
    }
    if (p2Values.size === 1 && p1Values.size > 1) {
        return { dayFirst: true, detectedPattern: "DD/MM/YYYY (inferred by month invariance)" };
    }

    // 3. Delimiter heuristic:
    // Slashes (e.g. 07/01/2026) are predominantly MM/DD/YYYY in US/cloud exports.
    // Dashes (e.g. 01-07-2026) are predominantly DD-MM-YYYY in global exports.
    if (slashCount > dashCount) {
        return { dayFirst: false, detectedPattern: "MM/DD/YYYY" };
    }

    return { dayFirst: true, detectedPattern: "DD/MM/YYYY" };
}

/**
 * Robustly parses any date representation into a Date object without timezone shifting.
 * 
 * Supports:
 * - Excel numeric serial numbers (e.g. 45473)
 * - ISO strings / YYYY-MM-DD / YYYY/MM/DD
 * - DD-MMM-YYYY / DD MMM YYYY / MMM DD, YYYY
 * - DD/MM/YYYY / MM/DD/YYYY / DD-MM-YY / MM-DD-YY
 * - Epoch timestamps (seconds or ms)
 * 
 * @param {any} val 
 * @param {boolean|null} dayFirstOverride - true for DD/MM, false for MM/DD, null for auto
 * @returns {Date|null}
 */
export function parseDate(val, dayFirstOverride = null) {
    if (val === undefined || val === null || val === "" || val === "NULL" || val === "null" || val === "undefined") {
        return null;
    }

    if (val instanceof Date) {
        return isNaN(val.getTime()) ? null : val;
    }

    // Handle Excel serial date numbers (e.g. 44000 - 60000)
    if (typeof val === "number" && val >= 1000 && val <= 150000) {
        const excelDate = excelSerialToDate(val);
        if (excelDate) return excelDate;
    }

    // Handle numeric strings (e.g. "45473")
    if (typeof val === "string" && /^\d{5}(\.\d+)?$/.test(val.trim())) {
        const numVal = parseFloat(val.trim());
        const excelDate = excelSerialToDate(numVal);
        if (excelDate) return excelDate;
    }

    // Epoch timestamp in milliseconds or seconds (e.g. 10 digits or 13 digits)
    if (typeof val === "number" || (!isNaN(val) && !isNaN(parseFloat(val)) && String(val).trim().length >= 10 && /^\d+$/.test(String(val).trim()))) {
        const num = Number(val);
        const epochMs = num > 1e11 ? num : num * 1000;
        const d = new Date(epochMs);
        return isNaN(d.getTime()) ? null : d;
    }

    const str = String(val).trim();
    if (!str) return null;

    // 1. YYYY-MM-DD or YYYY/MM/DD (with optional time)
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

    // 2. DD-MMM-YYYY, DD MMM YYYY, DD-MMMM-YYYY (e.g. 01-Jul-2026, 15 July 2026, 30-Jun-26)
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

    // 3. MMM DD, YYYY or MMM DD YYYY (e.g. Jul 01, 2026, July 15, 2026)
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

    // 4. DD-MM-YYYY, MM-DD-YYYY, DD/MM/YYYY, MM/DD/YYYY, DD.MM.YYYY
    const dmyMatch = str.match(/^(\d{1,2})([-/.])(\d{1,2})[-/.](\d{2,4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
    if (dmyMatch) {
        const p1 = parseInt(dmyMatch[1], 10);
        const delim = dmyMatch[2];
        const p2 = parseInt(dmyMatch[3], 10);
        let year = parseInt(dmyMatch[4], 10);
        if (year < 100) year += 2000;

        let day, month;

        if (p1 > 12 && p2 <= 12) {
            // Unambiguously DD/MM/YYYY
            day = p1;
            month = p2 - 1;
        } else if (p2 > 12 && p1 <= 12) {
            // Unambiguously MM/DD/YYYY
            month = p1 - 1;
            day = p2;
        } else if (dayFirstOverride === true) {
            // Explicit DD/MM/YYYY
            day = p1;
            month = p2 - 1;
        } else if (dayFirstOverride === false) {
            // Explicit MM/DD/YYYY
            month = p1 - 1;
            day = p2;
        } else {
            // Default heuristic based on delimiter:
            // Slashes -> MM/DD/YYYY (US standard)
            // Dashes / Dots -> DD-MM-YYYY (Global standard)
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

    // 5. Fallback: Parse with Date constructor
    const nativeDate = new Date(str);
    if (!isNaN(nativeDate.getTime())) {
        return nativeDate;
    }

    return null;
}

/**
 * Returns formatted month string "MMM YYYY" (e.g. "Jul 2026")
 */
export function formatMonthYear(dateVal, dayFirst = null) {
    const d = parseDate(dateVal, dayFirst);
    if (!d) return "";
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Returns YYYY-MM-DD string in local time
 */
export function formatDateISO(dateVal, dayFirst = null) {
    const d = parseDate(dateVal, dayFirst);
    if (!d) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns user-friendly date string (e.g. "30 Jun 2026")
 */
export function formatDateDisplay(dateVal, dayFirst = null) {
    const d = parseDate(dateVal, dayFirst);
    if (!d) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
}

/**
 * Sorts array of "MMM YYYY" strings chronologically (e.g. May 2026, Jun 2026, Jul 2026)
 */
export function sortMonthsChronologically(months = []) {
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
