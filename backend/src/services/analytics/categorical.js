const detector = require("../parser/detector");

exports.analyze = (rows = []) => {
    if (!rows.length) return {};

    const schema = detector.detectSchema(rows);

    const result = {};

    Object.entries(schema).forEach(([column, info]) => {
        if (info.type !== "categorical") return;

        const frequency = {};

        rows.forEach((row) => {
            let value = row[column];

            if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            ) {
                value = "NULL";
            }

            value = String(value).trim();

            frequency[value] = (frequency[value] || 0) + 1;
        });

        const total = rows.length;

        const distribution = Object.entries(frequency)
            .map(([value, count]) => ({
                value,
                count,
                percentage: Number(
                    ((count / total) * 100).toFixed(2)
                )
            }))
            .sort((a, b) => b.count - a.count);

        result[column] = {
            uniqueValues: distribution.length,
            topValue: distribution[0]?.value || null,
            topCount: distribution[0]?.count || 0,
            distribution
        };
    });

    return result;
};