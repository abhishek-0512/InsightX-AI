const dayjs = require("dayjs");
const detector = require("./detector");

exports.analyze = (rows) => {

    const monthly = {};

    rows.forEach((row) => {

        const dateValue = detector.getValue(
            row,
            [
                "date",
                "transaction_date",
                "created_at",
                "createdat",
                "payment_date",
                "timestamp"
            ]
        );

        if (!dateValue) return;

        const date = dayjs(dateValue);

        if (!date.isValid()) return;

        const month = date.format("MMM YYYY");

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

        if (!monthly[month]) {

            monthly[month] = {
                transactions: 0,
                amount: 0
            };

        }

        monthly[month].transactions++;

        monthly[month].amount += amount;

    });

    const peakMonth =
        Object.entries(monthly)
            .sort(
                (a, b) =>
                    b[1].amount - a[1].amount
            )[0] || null;

    return {

        available:
            Object.keys(monthly).length > 0,

        monthly,

        peakMonth

    };

};