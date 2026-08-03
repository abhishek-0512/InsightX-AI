const detector = require("../parser/detector");

const groupByMonth = (date) => {
    const d = new Date(date);

    if (isNaN(d)) return null;

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const groupByDate = (date) => {
    const d = new Date(date);

    if (isNaN(d)) return null;

    return d.toISOString().split("T")[0];
};

const groupByHour = (date) => {
    const d = new Date(date);

    if (isNaN(d)) return null;

    return d.getHours();
};

exports.analyze = (rows = []) => {

    if (!rows.length) return {};

    const schema = detector.detectSchema(rows);

    const result = {};

    Object.entries(schema).forEach(([column, info]) => {

        if (info.type !== "datetime") return;

        const values = rows
            .map(row => row[column])
            .filter(Boolean)
            .map(value => new Date(value))
            .filter(date => !isNaN(date));

        if (!values.length) return;

        const monthly = {};
        const daily = {};
        const hourly = {};

        values.forEach(date => {

            const month = groupByMonth(date);
            const day = groupByDate(date);
            const hour = groupByHour(date);

            monthly[month] = (monthly[month] || 0) + 1;
            daily[day] = (daily[day] || 0) + 1;
            hourly[hour] = (hourly[hour] || 0) + 1;

        });

        result[column] = {
            earliest: values.reduce((a, b) => a < b ? a : b),
            latest: values.reduce((a, b) => a > b ? a : b),
            monthly,
            daily,
            hourly
        };

    });

    return result;

};