import {
    parseDate,
    formatMonthYear,
    formatDateISO,
    sortMonthsChronologically,
    detectDatasetDateFormat
} from "./dateParser.js";
import { formatCurrency, getCurrencySymbol, detectDatasetCurrency } from "./currency.js";

function getColumnValue(row, possibleKeys) {
    if (!row) return null;
    const keys = Object.keys(row);
    for (const expected of possibleKeys) {
        const expectedNorm = String(expected || "").toLowerCase().replace(/[\s_-]/g, "");
        for (const key of keys) {
            const keyNorm = String(key || "").toLowerCase().replace(/[\s_-]/g, "");
            if (keyNorm === expectedNorm) {
                return row[key];
            }
        }
    }
    return null;
}

const amountKeys = [
    "amount",
    "transaction_amount",
    "txn_amount",
    "txnamount",
    "payment_amount",
    "order_amount",
    "settlement_amount",
    "amt",
    "value",
    "total",
    "paid_amount",
    "gross_amount",
    "price"
];

const refundKeys = [
    "is_refund",
    "refund",
    "isrefund",
    "refund_flag",
    "is_refunded"
];

const statusKeys = [
    "payment_status",
    "transaction_status",
    "status",
    "paymentstatus",
    "txn_status",
    "state",
    "order_status"
];

const modeKeys = [
    "payment_mode",
    "pay_mode",
    "mode",
    "paymentmethod",
    "payment_method",
    "channel",
    "gateway",
    "method"
];

const platformKeys = [
    "platform",
    "device",
    "device_name",
    "os",
    "app_platform",
    "client_platform",
    "browser"
];

const dateKeys = [
    "created_at",
    "entry_time",
    "transaction_date",
    "date",
    "updated_at",
    "timestamp",
    "txn_time",
    "payment_date"
];

/**
 * Pure client-side high-accuracy analytics engine
 */
export function computeAnalytics(rows = [], dayFirstOverride = null, currencyCode = "INR") {
    const totalTransactions = rows.length;

    // Detect dataset date format if not explicitly passed
    const detectedFormat = dayFirstOverride !== null
        ? { dayFirst: dayFirstOverride }
        : detectDatasetDateFormat(rows, dateKeys);

    const dayFirst = detectedFormat.dayFirst;

    let successfulSales = 0;
    let successfulTransactions = 0; // Total successful transactions (sales + successful refunds)
    let failedTransactions = 0;     // Total failed transactions (failed sales + failed refunds)
    let refundedTransactions = 0;   // Successful refunds
    let failedRefundTransactions = 0; // Failed refund attempts

    let totalAmount = 0; // Gross Revenue from completed successful sales
    let refundAmount = 0; // Successful refunds deductions
    let failedSalesAmount = 0; // Volume from failed sales attempts
    let attemptedSalesAmount = 0; // Total sales volume attempted (success + fail)
    let totalDatasetVolume = 0; // Total volume across all rows

    const paymentModes = {};
    const monthlyMap = {};
    const dailyMap = {};
    const platformMap = {};

    rows.forEach((row) => {
        const amount = Number(getColumnValue(row, amountKeys)) || 0;
        totalDatasetVolume += amount;

        const isRefundVal = getColumnValue(row, refundKeys);
        const orderId = String(getColumnValue(row, ["order_id", "orderid", "reference_id"]) || "").toLowerCase();
        const action = String(getColumnValue(row, ["transaction_action", "action", "transaction_type", "type"]) || "").toLowerCase();

        const isRefundFlag =
            isRefundVal === "1" ||
            isRefundVal === 1 ||
            isRefundVal === "true" ||
            isRefundVal === true ||
            orderId.startsWith("refund_") ||
            action === "refund" ||
            action === "chargeback";

        const paymentStatus = String(
            getColumnValue(row, ["payment_status", "paymentstatus"]) || ""
        ).trim().toLowerCase();

        const statusRaw = String(
            getColumnValue(row, statusKeys) || ""
        ).trim().toLowerCase();

        const isSuccess =
            paymentStatus === "success" ||
            paymentStatus === "successful" ||
            paymentStatus === "completed" ||
            paymentStatus === "captured" ||
            paymentStatus === "paid" ||
            paymentStatus === "settled" ||
            (!paymentStatus && (statusRaw === "success" || statusRaw === "successful" || statusRaw === "completed" || statusRaw === "0" || statusRaw === "ok" || statusRaw === "paid"));

        const isFailure =
            paymentStatus.includes("fail") ||
            paymentStatus.includes("declined") ||
            paymentStatus.includes("reject") ||
            paymentStatus.includes("error") ||
            paymentStatus.includes("cancel") ||
            (!paymentStatus && (statusRaw.includes("fail") || statusRaw.includes("declined") || statusRaw.includes("reject") || statusRaw === "1" || statusRaw.includes("cancel")));

        const isRefund = isRefundFlag || statusRaw.includes("refund");

        if (isRefund) {
            if (isSuccess) {
                // Successful refund is counted in successful transactions and refund count
                refundedTransactions++;
                successfulTransactions++;
                refundAmount += amount;
            } else {
                // Failed refunds are counted as failed transactions
                failedRefundTransactions++;
                failedTransactions++;
            }
        } else {
            // Normal Sale Transaction
            attemptedSalesAmount += amount;
            if (isSuccess) {
                successfulSales++;
                successfulTransactions++;
                totalAmount += amount;
            } else if (isFailure) {
                failedTransactions++;
                failedSalesAmount += amount;
            } else {
                failedTransactions++;
                failedSalesAmount += amount;
            }
        }

        const mode = getColumnValue(row, modeKeys) || "Other";
        paymentModes[mode] = (paymentModes[mode] || 0) + 1;

        const platform = getColumnValue(row, platformKeys) || "Other";
        platformMap[platform] = (platformMap[platform] || 0) + 1;

        const dateVal = getColumnValue(row, dateKeys);
        const d = parseDate(dateVal, dayFirst);

        if (d) {
            const mKey = formatMonthYear(d, dayFirst);
            if (mKey) {
                if (!monthlyMap[mKey]) {
                    monthlyMap[mKey] = {
                        month: mKey,
                        transactions: 0,
                        successfulSales: 0,
                        successfulTransactions: 0,
                        failedTransactions: 0,
                        refundedTransactions: 0,
                        failedRefundTransactions: 0,
                        amount: 0, // gross completed
                        refundAmount: 0,
                        paymentModes: {}
                    };
                }

                monthlyMap[mKey].transactions++;
                monthlyMap[mKey].paymentModes[mode] = (monthlyMap[mKey].paymentModes[mode] || 0) + 1;

                if (isRefund) {
                    if (isSuccess) {
                        monthlyMap[mKey].refundedTransactions++;
                        monthlyMap[mKey].successfulTransactions++;
                        monthlyMap[mKey].refundAmount += amount;
                    } else {
                        monthlyMap[mKey].failedRefundTransactions++;
                        monthlyMap[mKey].failedTransactions++;
                    }
                } else {
                    if (isSuccess) {
                        monthlyMap[mKey].successfulSales++;
                        monthlyMap[mKey].successfulTransactions++;
                        monthlyMap[mKey].amount += amount;
                    } else {
                        monthlyMap[mKey].failedTransactions++;
                    }
                }
            }

            const dKey = formatDateISO(d, dayFirst);
            if (dKey) {
                if (!dailyMap[dKey]) {
                    dailyMap[dKey] = { transactions: 0, amount: 0, success: 0, fail: 0, refunds: 0 };
                }
                dailyMap[dKey].transactions++;
                if (isRefund) {
                    if (isSuccess) {
                        dailyMap[dKey].refunds++;
                        dailyMap[dKey].success++;
                    } else {
                        dailyMap[dKey].fail++;
                    }
                } else {
                    if (isSuccess) {
                        dailyMap[dKey].success++;
                        dailyMap[dKey].amount += amount;
                    } else {
                        dailyMap[dKey].fail++;
                    }
                }
            }
        }
    });

    const successRate = totalTransactions === 0 ? 0 : Number(((successfulTransactions / totalTransactions) * 100).toFixed(2));
    const refundRate = totalTransactions === 0 ? 0 : Number(((refundedTransactions / totalTransactions) * 100).toFixed(2));
    const grossAmount = Number(totalAmount.toFixed(2));
    const finalRefundAmount = Number(refundAmount.toFixed(2));
    const netAmount = Number(Math.max(0, grossAmount - finalRefundAmount).toFixed(2));

    // Prepare chronologically sorted monthlyList
    const sortedMonthKeys = sortMonthsChronologically(Object.keys(monthlyMap));
    const monthlyList = sortedMonthKeys.map((key) => {
        const item = monthlyMap[key];
        const mGross = Number(item.amount.toFixed(2));
        const mRefund = Number(item.refundAmount.toFixed(2));
        const mNet = Number(Math.max(0, mGross - mRefund).toFixed(2));
        const mSuccessRate = item.transactions > 0
            ? Number(((item.successfulTransactions / item.transactions) * 100).toFixed(2))
            : 0;
        const mRefundRate = item.transactions > 0
            ? Number(((item.refundedTransactions / item.transactions) * 100).toFixed(2))
            : 0;

        const topModeEntry = Object.entries(item.paymentModes).sort((a, b) => b[1] - a[1])[0];
        const topMode = topModeEntry ? `${topModeEntry[0]} (${topModeEntry[1]})` : "-";

        return {
            month: key,
            transactions: item.transactions,
            successfulSales: item.successfulSales || 0,
            successfulTransactions: item.successfulTransactions,
            failedTransactions: item.failedTransactions,
            refundedTransactions: item.refundedTransactions,
            amount: mGross,
            grossAmount: mGross,
            refundAmount: mRefund,
            netAmount: mNet,
            successRate: mSuccessRate,
            refundRate: mRefundRate,
            paymentModes: item.paymentModes,
            topPaymentMode: topMode
        };
    });

    const formattedMonthlyMap = {};
    monthlyList.forEach((m) => {
        formattedMonthlyMap[m.month] = m;
    });

    // Generate AI Summary Insights with dynamic currency
    const aiSummary = [];
    aiSummary.push(`Total of ${totalTransactions.toLocaleString()} transaction record(s) analyzed.`);
    aiSummary.push(`Net Realized Revenue: ${formatCurrency(netAmount, currencyCode)} (Gross Completed Sales: ${formatCurrency(grossAmount, currencyCode)}) with an overall ${successRate}% success rate across all ${successfulTransactions.toLocaleString()} successful operations (${successfulSales.toLocaleString()} sales, ${refundedTransactions.toLocaleString()} refunds).`);

    if (refundedTransactions > 0) {
        aiSummary.push(`${refundedTransactions.toLocaleString()} successful refund(s) totaling ${formatCurrency(finalRefundAmount, currencyCode)} (${refundRate}% refund rate). Failed refund attempts are safely separated.`);
    } else {
        aiSummary.push(`No successful refund transactions detected in this selection.`);
    }

    if (failedTransactions > 0) {
        aiSummary.push(`${failedTransactions.toLocaleString()} transaction(s) failed or were declined (${((failedTransactions / totalTransactions) * 100).toFixed(1)}% failure rate, totaling ${formatCurrency(failedSalesAmount, currencyCode)} in uncollected attempts).`);
    }

    const topMode = Object.entries(paymentModes).sort((a, b) => b[1] - a[1])[0];
    if (topMode) {
        aiSummary.push(`Top payment mode is "${topMode[0]}" with ${topMode[1].toLocaleString()} transaction(s).`);
    }

    if (monthlyList.length > 1) {
        const peak = [...monthlyList].sort((a, b) => b.netAmount - a.netAmount)[0];
        if (peak) {
            aiSummary.push(`Cumulative Multi-Month Analysis: ${monthlyList.length} distinct months detected. Peak month by net revenue is ${peak.month} (${formatCurrency(peak.netAmount, currencyCode)} net).`);
        }
    }

    return {
        payment: {
            overview: {
                totalTransactions,
                successfulSales,
                successfulTransactions,
                failedTransactions,
                refundedTransactions,
                failedRefundTransactions
            },
            revenue: {
                totalAmount: grossAmount,
                refundAmount: finalRefundAmount,
                netAmount: netAmount,
                attemptedSalesAmount: Number(attemptedSalesAmount.toFixed(2)),
                failedSalesAmount: Number(failedSalesAmount.toFixed(2)),
                totalDatasetVolume: Number(totalDatasetVolume.toFixed(2))
            },
            averageAmount: successfulSales > 0 ? Number((grossAmount / successfulSales).toFixed(2)) : 0,
            successRate,
            refundRate,
            paymentModes
        },
        monthly: {
            available: monthlyList.length > 0,
            totalMonths: monthlyList.length,
            monthly: formattedMonthlyMap,
            monthlyList
        },
        platform: platformMap,
        daily: dailyMap,
        aiSummary,
        quality: {
            validRows: totalTransactions,
            totalRows: totalTransactions
        }
    };
}
