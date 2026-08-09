import {
    parseDate,
    formatMonthYear,
    formatDateISO,
    sortMonthsChronologically
} from "./dateParser";

function getColumnValue(row, possibleKeys) {
    if (!row) return null;
    const keys = Object.keys(row);
    for (const expected of possibleKeys) {
        const expectedNorm = expected.toLowerCase().replace(/[\s_-]/g, "");
        for (const key of keys) {
            const keyNorm = key.toLowerCase().replace(/[\s_-]/g, "");
            if (keyNorm === expectedNorm) {
                return row[key];
            }
        }
    }
    return null;
}

export function computeAnalytics(rows = []) {
    const totalTransactions = rows.length;

    let successfulTransactions = 0;
    let failedTransactions = 0;
    let refundedTransactions = 0;
    let failedRefundTransactions = 0;

    let totalAmount = 0; // Gross Revenue from successful sales
    let refundAmount = 0; // Successful refunds

    const paymentModes = {};
    const monthlyMap = {};
    const dailyMap = {};
    const platformMap = {};

    rows.forEach((row) => {
        const amount = Number(
            getColumnValue(row, ["amount", "transaction_amount", "payment_amount", "value", "total"])
        ) || 0;

        const isRefundVal = getColumnValue(row, ["is_refund", "refund", "isrefund"]);
        const orderId = String(getColumnValue(row, ["order_id", "orderid"]) || "").toLowerCase();
        const action = String(getColumnValue(row, ["transaction_action", "action"]) || "").toLowerCase();

        const isRefundFlag =
            isRefundVal === "1" ||
            isRefundVal === 1 ||
            isRefundVal === "true" ||
            isRefundVal === true ||
            orderId.startsWith("refund_") ||
            action === "refund";

        const paymentStatus = String(
            getColumnValue(row, ["payment_status", "paymentstatus"]) || ""
        ).trim().toLowerCase();

        const statusRaw = String(
            getColumnValue(row, [
                "payment_status",
                "transaction_status",
                "status"
            ]) || ""
        ).trim().toLowerCase();

        const isSuccess =
            paymentStatus === "success" ||
            paymentStatus === "successful" ||
            paymentStatus === "completed" ||
            paymentStatus === "captured" ||
            paymentStatus === "paid" ||
            (!paymentStatus && (statusRaw === "success" || statusRaw === "0" || statusRaw === "ok"));

        const isRefund = isRefundFlag || statusRaw.includes("refund");

        if (isRefund) {
            // ONLY SUCCESSFUL refunds are counted towards refund metrics
            if (isSuccess) {
                refundedTransactions++;
                refundAmount += amount;
            } else {
                // Failed refunds are counted as failed transactions
                failedRefundTransactions++;
                failedTransactions++;
            }
        } else {
            // Normal Sale Transaction
            if (isSuccess) {
                successfulTransactions++;
                totalAmount += amount;
            } else {
                failedTransactions++;
            }
        }

        const mode = getColumnValue(row, ["payment_mode", "pay_mode", "mode", "paymentmethod", "payment_method"]) || "Other";
        paymentModes[mode] = (paymentModes[mode] || 0) + 1;

        const platform = getColumnValue(row, ["platform", "device_name", "device"]) || "Other";
        platformMap[platform] = (platformMap[platform] || 0) + 1;

        const dateVal = getColumnValue(row, [
            "created_at",
            "entry_time",
            "date",
            "transaction_date",
            "createdat",
            "payment_date",
            "timestamp"
        ]);

        const d = parseDate(dateVal);
        if (d) {
            const mKey = formatMonthYear(d);
            if (mKey) {
                if (!monthlyMap[mKey]) {
                    monthlyMap[mKey] = {
                        month: mKey,
                        transactions: 0,
                        successfulTransactions: 0,
                        failedTransactions: 0,
                        refundedTransactions: 0,
                        failedRefundTransactions: 0,
                        amount: 0, // gross
                        refundAmount: 0,
                        paymentModes: {}
                    };
                }

                monthlyMap[mKey].transactions++;
                monthlyMap[mKey].paymentModes[mode] = (monthlyMap[mKey].paymentModes[mode] || 0) + 1;

                if (isRefund) {
                    if (isSuccess) {
                        monthlyMap[mKey].refundedTransactions++;
                        monthlyMap[mKey].refundAmount += amount;
                    } else {
                        monthlyMap[mKey].failedRefundTransactions++;
                        monthlyMap[mKey].failedTransactions++;
                    }
                } else {
                    if (isSuccess) {
                        monthlyMap[mKey].successfulTransactions++;
                        monthlyMap[mKey].amount += amount;
                    } else {
                        monthlyMap[mKey].failedTransactions++;
                    }
                }
            }

            const dKey = formatDateISO(d);
            if (dKey) {
                if (!dailyMap[dKey]) {
                    dailyMap[dKey] = { transactions: 0, amount: 0, success: 0, fail: 0, refunds: 0 };
                }
                dailyMap[dKey].transactions++;
                if (isRefund) {
                    if (isSuccess) dailyMap[dKey].refunds++;
                    else dailyMap[dKey].fail++;
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

    // Prepare sorted monthlyList
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

    // Generate AI Summary Insights
    const aiSummary = [];
    aiSummary.push(`Total of ${totalTransactions.toLocaleString()} transaction record(s) analyzed.`);
    aiSummary.push(`Net Revenue: ₹${netAmount.toLocaleString()} (Gross: ₹${grossAmount.toLocaleString()}) with an overall ${successRate}% success rate.`);

    if (refundedTransactions > 0) {
        aiSummary.push(`${refundedTransactions} successful refund(s) totaling ₹${finalRefundAmount.toLocaleString()} (${refundRate}% refund rate). Failed refund attempts are safely excluded.`);
    } else {
        aiSummary.push(`No successful refund transactions detected in this selection.`);
    }

    if (failedTransactions > 0) {
        aiSummary.push(`${failedTransactions} transaction(s) failed or were declined (${((failedTransactions / totalTransactions) * 100).toFixed(1)}% failure rate).`);
    }

    const topMode = Object.entries(paymentModes).sort((a, b) => b[1] - a[1])[0];
    if (topMode) {
        aiSummary.push(`Top payment mode is "${topMode[0]}" with ${topMode[1]} transaction(s).`);
    }

    if (monthlyList.length > 1) {
        const peak = [...monthlyList].sort((a, b) => b.netAmount - a.netAmount)[0];
        if (peak) {
            aiSummary.push(`Cumulative Multi-Month Analysis: ${monthlyList.length} distinct months detected. Peak month by net revenue is ${peak.month} (₹${peak.netAmount.toLocaleString()} net).`);
        }
    }

    return {
        payment: {
            overview: {
                totalTransactions,
                successfulTransactions,
                failedTransactions,
                refundedTransactions,
                failedRefundTransactions
            },
            paymentModes,
            revenue: {
                totalAmount: grossAmount,
                refundAmount: finalRefundAmount,
                netAmount
            },
            successRate,
            refundRate
        },
        monthly: {
            monthly: formattedMonthlyMap,
            monthlyList,
            totalMonths: monthlyList.length
        },
        daily: dailyMap,
        platform: platformMap,
        aiSummary
    };
}
