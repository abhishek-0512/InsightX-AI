export const CURRENCIES = [
    { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", flag: "🇮🇳" },
    { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", flag: "🇺🇸" },
    { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", flag: "🇪🇺" },
    { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", flag: "🇬🇧" },
    { code: "AED", symbol: "AED", name: "UAE Dirham", locale: "en-AE", flag: "🇦🇪" },
    { code: "CAD", symbol: "CA$", name: "Canadian Dollar", locale: "en-CA", flag: "🇨🇦" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU", flag: "🇦🇺" },
    { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG", flag: "🇸🇬" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP", flag: "🇯🇵" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan", locale: "zh-CN", flag: "🇨🇳" },
    { code: "SAR", symbol: "SAR", name: "Saudi Riyal", locale: "en-SA", flag: "🇸🇦" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc", locale: "de-CH", flag: "🇨🇭" }
];

export const CURRENCY_MAP = CURRENCIES.reduce((acc, curr) => {
    acc[curr.code] = curr;
    return acc;
}, {});

/**
 * Formats a numeric value with the specified currency code without altering the raw number
 * @param {number} val 
 * @param {string} currencyCode 
 * @param {number} maximumFractionDigits 
 * @returns {string}
 */
export function formatCurrency(val, currencyCode = "INR", maximumFractionDigits = 2) {
    if (val === undefined || val === null || isNaN(val)) {
        const curr = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.INR;
        return `${curr.symbol}0.00`;
    }

    const numericVal = Number(val);
    const curr = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.INR;

    try {
        return new Intl.NumberFormat(curr.locale, {
            style: "currency",
            currency: curr.code,
            maximumFractionDigits
        }).format(numericVal);
    } catch (e) {
        return `${curr.symbol}${numericVal.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits
        })}`;
    }
}

/**
 * Gets currency symbol for a currency code
 * @param {string} currencyCode 
 * @returns {string}
 */
export function getCurrencySymbol(currencyCode = "INR") {
    const curr = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.INR;
    return curr.symbol;
}

/**
 * Auto-detects currency from a dataset's rows
 * @param {Array<Object>} rows 
 * @returns {string}
 */
export function detectDatasetCurrency(rows = []) {
    if (!rows || !rows.length) return "INR";

    const currencyKeys = ["currency", "currency_code", "txn_currency", "currencycode", "curr"];

    for (let i = 0; i < Math.min(rows.length, 50); i++) {
        const row = rows[i];
        if (!row) continue;

        for (const key of Object.keys(row)) {
            const keyNorm = key.toLowerCase().replace(/[\s_-]/g, "");
            if (currencyKeys.includes(keyNorm)) {
                const val = String(row[key] || "").trim().toUpperCase();
                if (CURRENCY_MAP[val]) return val;
                if (val === "$" || val === "USD") return "USD";
                if (val === "€" || val === "EUR") return "EUR";
                if (val === "£" || val === "GBP") return "GBP";
                if (val === "₹" || val === "INR" || val === "RS" || val === "RS.") return "INR";
                if (val === "AED" || val === "DHS") return "AED";
            }
        }
    }

    return "INR";
}
