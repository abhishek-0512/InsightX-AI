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

/**
 * Robustly parses any date representation into a local Date object without timezone shifting.
 * 
 * Supports:
 * - DD-MM-YY HH:mm / DD-MM-YYYY HH:mm:ss / DD-MM-YY / DD-MM-YYYY
 * - DD/MM/YY HH:mm / DD/MM/YYYY
 * - YYYY-MM-DD / YYYY-MM-DD HH:mm:ss / YYYY/MM/DD
 * - DD-MMM-YYYY / DD-MMM-YY / DD MMM YYYY (e.g. "01-Jul-2026", "15 July 2026")
 * - MMM DD, YYYY / MMM DD YYYY (e.g. "Jul 01, 2026")
 * - Timestamps (epoch ms or seconds) & ISO strings
 * 
 * @param {any} val 
 * @returns {Date|null}
 */
function parseDate(val) {
    if (!val || val === "NULL" || val === "null" || val === "undefined") {
        return null;
    }

    if (val instanceof Date) {
        return isNaN(val.getTime()) ? null : val;
    }

    // Epoch number / numeric string
    if (typeof val === "number" || (!isNaN(val) && !isNaN(parseFloat(val)) && String(val).trim().length >= 10 && /^\d+$/.test(String(val).trim()))) {
        const num = Number(val);
        const epochMs = num > 1e11 ? num : num * 1000;
        const d = new Date(epochMs);
        return isNaN(d.getTime()) ? null : d;
    }

    const str = String(val).trim();
    if (!str) return null;

    // 1. YYYY-MM-DD or YYYY/MM/DD (with optional time)
    const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
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

    // 2. DD-MMM-YYYY or DD-MMM-YY (e.g. 01-Jul-2026, 1-July-26)
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

    // 3. MMM DD, YYYY or MMM DD YYYY (e.g. Jul 01, 2026)
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

    // 4. DD-MM-YY, DD-MM-YYYY, DD/MM/YYYY or MM/DD/YYYY
    const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
    if (dmyMatch) {
        let p1 = parseInt(dmyMatch[1], 10);
        let p2 = parseInt(dmyMatch[2], 10);
        let year = parseInt(dmyMatch[3], 10);
        if (year < 100) year += 2000;

        let day, month;
        if (p1 > 12 && p2 <= 12) {
            // Definitely DD-MM-YYYY
            day = p1;
            month = p2 - 1;
        } else if (p2 > 12 && p1 <= 12) {
            // Definitely MM-DD-YYYY
            month = p1 - 1;
            day = p2;
        } else {
            // Standard DD-MM-YYYY format
            day = p1;
            month = p2 - 1;
        }

        const hh = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
        const mm = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
        const ss = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;

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
function formatMonthYear(dateVal) {
    const d = parseDate(dateVal);
    if (!d) return null;
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Returns YYYY-MM-DD string in local time without UTC offset bug
 */
function formatDateISO(dateVal) {
    const d = parseDate(dateVal);
    if (!d) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Sorts array of "MMM YYYY" strings chronologically (e.g. May 2026, Jun 2026, Jul 2026)
 */
function sortMonthsChronologically(months = []) {
    return [...months].sort((a, b) => {
        const [mA, yA] = a.split(" ");
        const [mB, yB] = b.split(" ");
        const yearDiff = parseInt(yA, 10) - parseInt(yB, 10);
        if (yearDiff !== 0) return yearDiff;
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
    MONTH_NAMES
};
