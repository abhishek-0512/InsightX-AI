const detector = require("./detector");
const { parseDate, formatMonthYear, sortMonthsChronologically } = require("../../utils/dateParser");

exports.analyze = (rows = []) => {
    const monthlyMap = {};

    rows.forEach((row) => {
        const dateValue = detector.getValue(row, [
            "created_at",
            "entry_time",
            "date",
            "transaction_date",
            "createdat",
            "payment_date",
            "timestamp"
        ]);

        if (!dateValue) return;

        const date = parseDate(dateValue);
        if (!date) return;

        const monthKey = formatMonthYear(date);
        if (!monthKey) return;

        const amount = Number(
            detector.getValue(row, [
                "amount",
                "transaction_amount",
                "payment_amount",
                "value",
                "total"
            ])
        ) || 0;

        const isRefundVal = detector.getValue(row, ["is_refund", "refund", "isrefund"]);
        const orderId = String(detector.getValue(row, ["order_id", "orderid"]) || "").toLowerCase();
        const action = String(detector.getValue(row, ["transaction_action", "action"]) || "").toLowerCase();

        const isRefundFlag =
            isRefundVal === "1" ||
            isRefundVal === 1 ||
            isRefundVal === "true" ||
            isRefundVal === true ||
            orderId.startsWith("refund_") ||
            action === "refund";

        const paymentStatus = String(
            detector.getValue(row, ["payment_status", "paymentstatus"]) || ""
        ).trim().toLowerCase();

        const statusRaw = String(
            detector.getValue(row, [
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

        const isFailure =
            paymentStatus.includes("fail") ||
            paymentStatus.includes("declined") ||
            paymentStatus.includes("reject") ||
            paymentStatus.includes("error") ||
            (!paymentStatus && (statusRaw.includes("fail") || statusRaw.includes("declined") || statusRaw === "1"));

        const mode = detector.getValue(row, [
            "payment_mode",
            "pay_mode",
            "mode",
            "paymentmethod",
            "payment_method"
        ]) || "Unknown";

        if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = {
                month: monthKey,
                transactions: 0,
                successfulTransactions: 0,
                failedTransactions: 0,
                refundedTransactions: 0,
                failedRefundTransactions: 0,
                amount: 0, // Gross amount
                refundAmount: 0,
                paymentModes: {}
            };
        }

        const mStats = monthlyMap[monthKey];
        mStats.transactions++;

        if (isRefundFlag || statusRaw.includes("refund")) {
            if (isSuccess) {
                mStats.refundedTransactions++;
                mStats.refundAmount += amount;
            } else {
                mStats.failedRefundTransactions++;
                mStats.failedTransactions++;
            }
        } else {
            if (isSuccess) {
                mStats.successfulTransactions++;
                mStats.amount += amount;
            } else {
                mStats.failedTransactions++;
            }
        }

        mStats.paymentModes[mode] = (mStats.paymentModes[mode] || 0) + 1;
    });

    const sortedMonthKeys = sortMonthsChronologically(Object.keys(monthlyMap));
    const monthlyList = sortedMonthKeys.map((key) => {
        const item = monthlyMap[key];
        const gross = Number(item.amount.toFixed(2));
        const refund = Number(item.refundAmount.toFixed(2));
        const net = Number(Math.max(0, gross - refund).toFixed(2));
        const successRate = item.transactions > 0
            ? Number(((item.successfulTransactions / item.transactions) * 100).toFixed(2))
            : 0;
        const refundRate = item.transactions > 0
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
            amount: gross, // for backward compatibility
            grossAmount: gross,
            refundAmount: refund,
            netAmount: net,
            successRate,
            refundRate,
            paymentModes: item.paymentModes,
            topPaymentMode: topMode
        };
    });

    const finalMonthlyMap = {};
    monthlyList.forEach((m) => {
        finalMonthlyMap[m.month] = m;
    });

    const peakMonth =
        [...monthlyList].sort((a, b) => b.grossAmount - a.grossAmount)[0] || null;

    return {
        available: monthlyList.length > 0,
        monthly: finalMonthlyMap,
        monthlyList,
        totalMonths: monthlyList.length,
        peakMonth: peakMonth ? [peakMonth.month, peakMonth] : null
    };
};