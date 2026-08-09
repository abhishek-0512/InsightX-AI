const detector = require("./detector");

exports.analyze = (rows = []) => {
    let totalRefunds = 0; // Successful refunds count
    let totalRefundAttempts = 0;
    let failedRefunds = 0;
    let refundAmount = 0; // Successful refunds amount

    const refundReasons = {};

    rows.forEach((row) => {
        const isRefundVal = detector.getValue(row, ["is_refund", "refund", "isrefund"]);
        const orderId = String(detector.getValue(row, ["order_id", "orderid"]) || "").toLowerCase();
        const action = String(detector.getValue(row, ["transaction_action", "action"]) || "").toLowerCase();

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

        const isRefund =
            isRefundVal === "1" ||
            isRefundVal === 1 ||
            isRefundVal === "true" ||
            isRefundVal === true ||
            orderId.startsWith("refund_") ||
            action === "refund" ||
            statusRaw.includes("refund");

        if (!isRefund) {
            return;
        }

        totalRefundAttempts++;

        const isSuccess =
            paymentStatus === "success" ||
            paymentStatus === "successful" ||
            paymentStatus === "completed" ||
            paymentStatus === "captured" ||
            paymentStatus === "paid" ||
            (!paymentStatus && (statusRaw === "success" || statusRaw === "0" || statusRaw === "ok"));

        const amount =
            Number(
                detector.getValue(row, [
                    "amount",
                    "transaction_amount",
                    "payment_amount",
                    "value",
                    "total"
                ])
            ) || 0;

        if (isSuccess) {
            totalRefunds++;
            refundAmount += amount;

            const reason =
                detector.getValue(row, [
                    "refund_reason",
                    "reason",
                    "remarks"
                ]) || "Customer Refund";

            refundReasons[reason] = (refundReasons[reason] || 0) + 1;
        } else {
            failedRefunds++;
        }
    });

    const topReason =
        Object.entries(refundReasons).sort((a, b) => b[1] - a[1])[0] || null;

    return {
        available: totalRefunds > 0,
        totalRefunds, // Only successful refunds
        totalRefundAttempts,
        failedRefunds,
        refundAmount: Number(refundAmount.toFixed(2)),
        refundReasons,
        topReason
    };
};