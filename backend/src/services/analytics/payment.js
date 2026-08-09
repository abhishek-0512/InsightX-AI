const detector = require("./detector");

exports.analyze = (rows = []) => {
    let totalTransactions = rows.length;

    let successfulTransactions = 0;
    let failedTransactions = 0;
    let refundedTransactions = 0;
    let failedRefundTransactions = 0;

    let totalAmount = 0; // Gross Revenue
    let refundAmount = 0; // Successful Refunds Amount

    const paymentModes = {};

    rows.forEach((row) => {
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

        if (isRefundFlag || statusRaw.includes("refund")) {
            // Only SUCCESSFUL refunds are counted towards refund metrics
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
            } else if (isFailure) {
                failedTransactions++;
            } else {
                // Unknown / pending fallback
                failedTransactions++;
            }
        }

        const mode =
            detector.getValue(row, [
                "payment_mode",
                "pay_mode",
                "mode",
                "paymentmethod",
                "payment_method"
            ]) || "Unknown";

        paymentModes[mode] = (paymentModes[mode] || 0) + 1;
    });

    const successRate =
        totalTransactions === 0
            ? 0
            : Number(((successfulTransactions / totalTransactions) * 100).toFixed(2));

    const refundRate =
        totalTransactions === 0
            ? 0
            : Number(((refundedTransactions / totalTransactions) * 100).toFixed(2));

    const grossAmount = Number(totalAmount.toFixed(2));
    const finalRefundAmount = Number(refundAmount.toFixed(2));
    const netAmount = Number(Math.max(0, grossAmount - finalRefundAmount).toFixed(2));

    return {
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
    };
};