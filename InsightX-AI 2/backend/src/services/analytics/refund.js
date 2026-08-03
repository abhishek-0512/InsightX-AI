const detector = require("./detector");

exports.analyze = (rows) => {

    let totalRefunds = 0;
    let refundAmount = 0;

    const refundReasons = {};

    rows.forEach((row) => {

        const status = String(
            detector.getValue(
                row,
                [
                    "status",
                    "payment_status",
                    "transaction_status"
                ]
            ) || ""
        ).toLowerCase();

        if (!status.includes("refund")) {
            return;
        }

        totalRefunds++;

        const amount =
            Number(
                detector.getValue(
                    row,
                    [
                        "amount",
                        "transaction_amount",
                        "payment_amount",
                        "value"
                    ]
                )
            ) || 0;

        refundAmount += amount;

        const reason =
            detector.getValue(
                row,
                [
                    "refund_reason",
                    "reason",
                    "remarks"
                ]
            ) || "Unknown";

        refundReasons[reason] =
            (refundReasons[reason] || 0) + 1;

    });

    const topReason = Object.entries(refundReasons)
        .sort((a, b) => b[1] - a[1])[0] || null;

    return {

        available: totalRefunds > 0,

        totalRefunds,

        refundAmount,

        refundReasons,

        topReason

    };

};