const detector = require("./detector");

exports.analyze = (rows) => {

    let totalFailures = 0;

    const failureReasons = {};

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

        if (
            !status.includes("fail") &&
            !status.includes("declined") &&
            !status.includes("error")
        ) {
            return;
        }

        totalFailures++;

        const reason =
            detector.getValue(
                row,
                [
                    "failure_reason",
                    "reason",
                    "error",
                    "error_message",
                    "remarks"
                ]
            ) || "Unknown";

        failureReasons[reason] =
            (failureReasons[reason] || 0) + 1;

    });

    const topReason =
        Object.entries(failureReasons)
            .sort((a, b) => b[1] - a[1])[0] || null;

    return {

        available: totalFailures > 0,

        totalFailures,

        failureReasons,

        topReason

    };

};