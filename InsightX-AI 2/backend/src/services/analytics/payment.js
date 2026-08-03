const detector = require("../parser/detector");

exports.analyze = (rows) => {

    let totalTransactions = rows.length;

    let successfulTransactions = 0;
    let failedTransactions = 0;
    let refundedTransactions = 0;

    let totalAmount = 0;
    let refundAmount = 0;

    const paymentModes = {};

    rows.forEach((row) => {

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

        totalAmount += amount;

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

        if (status.includes("success")) {

            successfulTransactions++;

        } else if (
            status.includes("fail") ||
            status.includes("declined")
        ) {

            failedTransactions++;

        } else if (
            status.includes("refund")
        ) {

            refundedTransactions++;

            refundAmount += amount;

        }

        const mode =
            detector.getValue(
                row,
                [
                    "payment_mode",
                    "mode",
                    "paymentmethod",
                    "payment_method"
                ]
            ) || "Unknown";

        paymentModes[mode] =
            (paymentModes[mode] || 0) + 1;

    });

    const successRate =
        totalTransactions === 0
            ? 0
            : Number(
                  (
                      (successfulTransactions /
                          totalTransactions) *
                      100
                  ).toFixed(2)
              );

    const refundRate =
        totalTransactions === 0
            ? 0
            : Number(
                  (
                      (refundedTransactions /
                          totalTransactions) *
                      100
                  ).toFixed(2)
              );

    return {

        overview: {
            totalTransactions,
            successfulTransactions,
            failedTransactions,
            refundedTransactions
        },

        paymentModes,

        revenue: {
            totalAmount,
            refundAmount,
            netAmount:
                totalAmount - refundAmount
        },

        successRate,

        refundRate

    };

};