const detector = require("../parser/detector");

const toNumber = (value) => {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return null;
    }

    const number = Number(
        String(value)
            .replace(/,/g, "")
            .replace(/₹/g, "")
            .replace(/\$/g, "")
            .trim()
    );

    return Number.isNaN(number) ? null : number;
};

exports.analyze = (rows = []) => {
    if (!rows.length) return {};

    const schema = detector.detectSchema(rows);

    const result = {};

    Object.entries(schema).forEach(([column, info]) => {
        if (info.type !== "numeric") return;

        const values = rows
            .map((row) => toNumber(row[column]))
            .filter((value) => value !== null);

        if (!values.length) return;

        const sum = values.reduce((a, b) => a + b, 0);

        const sorted = [...values].sort((a, b) => a - b);

        const median =
            sorted.length % 2 === 0
                ? (
                      sorted[sorted.length / 2] +
                      sorted[sorted.length / 2 - 1]
                  ) / 2
                : sorted[Math.floor(sorted.length / 2)];

        const variance =
            values.reduce(
                (acc, value) =>
                    acc + Math.pow(value - sum / values.length, 2),
                0
            ) / values.length;

        result[column] = {
            count: values.length,
            sum: Number(sum.toFixed(2)),
            average: Number((sum / values.length).toFixed(2)),
            minimum: Math.min(...values),
            maximum: Math.max(...values),
            median: Number(median.toFixed(2)),
            variance: Number(variance.toFixed(2)),
            standardDeviation: Number(
                Math.sqrt(variance).toFixed(2)
            )
        };
    });

    return result;
};