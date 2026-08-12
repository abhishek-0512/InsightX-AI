const detector = require("./detector");

exports.analyze = (rows = []) => {
    let totalTransactions = rows.length;

    let successfulTransactions = 0;
    let failedTransactions = 0;
    let refundedTransactions = 0;
    let failedRefundTransactions = 0;

    let totalAmount = 0; // Gross Revenue
    let refundAmount = 0; // Successful Refunds Amount
    let salesAmount = 0;

    const paymentModes = {};

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

    rows.forEach((row) => {
        const amount = Number(detector.getValue(row, amountKeys)) || 0;

        const isRefundVal = detector.getValue(row, refundKeys);
        const orderId = String(detector.getValue(row, ["order_id", "orderid", "reference_id"]) || "").toLowerCase();
        const action = String(detector.getValue(row, ["transaction_action", "action", "transaction_type", "type"]) || "").toLowerCase();

        const isRefundFlag =
            isRefundVal === "1" ||
            isRefundVal === 1 ||
            isRefundVal === "true" ||
            isRefundVal === true ||
            orderId.startsWith("refund_") ||
            action === "refund" ||
            action === "chargeback";

        const paymentStatus = String(
            detector.getValue(row, ["payment_status", "paymentstatus"]) || ""
        ).trim().toLowerCase();

        const statusRaw = String(
            detector.getValue(row, statusKeys) || ""
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
            // Only SUCCESSFUL refunds are counted towards refund metrics
            if (isSuccess) {
                refundedTransactions++;
                successfulTransactions++;
                refundAmount += amount;
                totalAmount += amount;
            } else {
                // Failed refunds are counted as failed transactions
                failedRefundTransactions++;
                failedTransactions++;
            }
        } else {
            // Normal Sale Transaction
            if (isSuccess) {
                successfulTransactions++;
                salesAmount = (salesAmount || 0) + amount;
                totalAmount += amount;
            } else if (isFailure) {
                failedTransactions++;
            } else {
                // Unknown / pending fallback
                failedTransactions++;
            }
        }

        const mode = detector.getValue(row, modeKeys) || "Other";
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

    const grossRev = Number(totalAmount.toFixed(2));
    const refundRev = Number(refundAmount.toFixed(2));
    const salesRev = Number((salesAmount || (totalAmount - refundAmount)).toFixed(2));
    const netRev = Number(Math.max(0, grossRev - refundRev).toFixed(2));

    const grossAmount = Number(totalAmount.toFixed(2));
    const finalRefundAmount = Number(refundAmount.toFixed(2));
    const netAmount = Number(Math.max(0, grossAmount - finalRefundAmount).toFixed(2));

    return {
        overview: {
            totalTransactions,
            successfulSales: successfulTransactions - refundedTransactions,
            successfulTransactions,
            failedTransactions,
            refundedTransactions,
            failedRefundTransactions
        },
        paymentModes,
        revenue: {
            totalAmount: grossRev,
            salesAmount: salesRev,
            refundAmount: refundRev,
            netAmount: netRev
        },
        successRate,
        refundRate
    };
};