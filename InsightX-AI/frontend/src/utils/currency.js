export const CURRENCIES = [
    { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", flag: "🇮🇳", rateAgainstUSD: 83.50 },
    { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", flag: "🇺🇸", rateAgainstUSD: 1.0 },
    { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", flag: "🇪🇺", rateAgainstUSD: 0.92 },
    { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", flag: "🇬🇧", rateAgainstUSD: 0.79 },
    { code: "AED", symbol: "AED", name: "UAE Dirham", locale: "en-AE", flag: "🇦🇪", rateAgainstUSD: 3.6725 },
    { code: "CAD", symbol: "CA$", name: "Canadian Dollar", locale: "en-CA", flag: "🇨🇦", rateAgainstUSD: 1.36 },
    { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU", flag: "🇦🇺", rateAgainstUSD: 1.52 },
    { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG", flag: "🇸🇬", rateAgainstUSD: 1.35 },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP", flag: "🇯🇵", rateAgainstUSD: 155.0 },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan", locale: "zh-CN", flag: "🇨🇳", rateAgainstUSD: 7.24 },
    { code: "SAR", symbol: "SAR", name: "Saudi Riyal", locale: "en-SA", flag: "🇸🇦", rateAgainstUSD: 3.75 },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc", locale: "de-CH", flag: "🇨🇭", rateAgainstUSD: 0.90 }
];

export const CURRENCY_MAP = CURRENCIES.reduce((acc, curr) => {
    acc[curr.code] = curr;
    return acc;
}, {});

// In-memory dynamic rates cache initialized with standard fallbacks
let activeExchangeRates = CURRENCIES.reduce((acc, curr) => {
    acc[curr.code] = curr.rateAgainstUSD;
    return acc;
}, {});

/**
 * Converts an amount from one currency to another using exchange rates
 * @param {number} amount 
 * @param {string} fromCurrency 
 * @param {string} toCurrency 
 * @returns {number}
 */
export function convertCurrency(amount, fromCurrency = "INR", toCurrency = "INR") {
    if (!amount || isNaN(amount) || fromCurrency === toCurrency) {
        return Number(amount) || 0;
    }

    const fromRate = activeExchangeRates[fromCurrency] || CURRENCY_MAP[fromCurrency]?.rateAgainstUSD || 1.0;
    const toRate = activeExchangeRates[toCurrency] || CURRENCY_MAP[toCurrency]?.rateAgainstUSD || 1.0;

    // Convert from source currency to base USD, then from USD to target currency
    const amountInUSD = amount / fromRate;
    const converted = amountInUSD * toRate;

    return Number(converted.toFixed(2));
}

/**
 * Formats a numeric value with the specified currency code and optional FX conversion
 * @param {number} val 
 * @param {string} targetCurrencyCode 
 * @param {number} maximumFractionDigits 
 * @param {string} sourceCurrencyCode 
 * @returns {string}
 */
export function formatCurrency(val, targetCurrencyCode = "INR", maximumFractionDigits = 2, sourceCurrencyCode = null) {
    if (val === undefined || val === null || isNaN(val)) {
        const curr = CURRENCY_MAP[targetCurrencyCode] || CURRENCY_MAP.INR;
        return `${curr.symbol}0`;
    }

    let numericVal = Number(val);

    // If source currency is provided and differs from target, apply conversion
    if (sourceCurrencyCode && sourceCurrencyCode !== targetCurrencyCode) {
        numericVal = convertCurrency(numericVal, sourceCurrencyCode, targetCurrencyCode);
    }

    const curr = CURRENCY_MAP[targetCurrencyCode] || CURRENCY_MAP.INR;

    try {
        return new Intl.NumberFormat(curr.locale, {
            style: "currency",
            currency: curr.code,
            maximumFractionDigits
        }).format(numericVal);
    } catch (e) {
        return `${curr.symbol}${numericVal.toLocaleString(undefined, {
            minimumFractionDigits: 0,
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
 * Gets exchange rate representation e.g. "1 USD = ₹83.50"
 */
export function getExchangeRateLabel(fromCode = "USD", toCode = "INR") {
    const rate = convertCurrency(1, fromCode, toCode);
    const toCurr = CURRENCY_MAP[toCode] || CURRENCY_MAP.INR;
    return `1 ${fromCode} = ${toCurr.symbol}${rate.toLocaleString()} ${toCode}`;
}

/**
 * Auto-detects base currency from a dataset's rows
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

    // Heuristics: check customer phone or location
    const firstRow = rows[0] || {};
    const phone = String(firstRow.phone_number || firstRow.phone || firstRow.customer_id || "");
    if (phone.startsWith("91") || (phone.length === 10 && /^[6-9]/.test(phone))) {
        return "INR"; // Standard Indian phone pattern
    }

    return "INR";
}

/**
 * Optional background live rates updater
 */
export async function refreshLiveExchangeRates() {
    try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (res.ok) {
            const data = await res.json();
            if (data && data.rates) {
                CURRENCIES.forEach(c => {
                    if (data.rates[c.code]) {
                        activeExchangeRates[c.code] = data.rates[c.code];
                    }
                });
            }
        }
    } catch (err) {
        // Silently use hardcoded fallback rates
    }
}
