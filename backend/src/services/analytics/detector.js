const normalize = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]/g, "");

exports.getValue = (row, possibleKeys) => {

    const keys = Object.keys(row);

    for (const expected of possibleKeys) {

        const matched = keys.find(
            key => normalize(key) === normalize(expected)
        );

        if (matched) {
            return row[matched];
        }

    }

    return null;
};

exports.hasColumn = (rows, possibleKeys) => {
    if (!rows || rows.length === 0) {
        return false;
    }

    return exports.getValue(rows[0], possibleKeys) !== null;
};

exports.detectSchema = (rows = []) => {
    if (!rows || !rows.length) return {};
    const { parseDate } = require("../../utils/dateParser");
    const headers = Object.keys(rows[0]);
    const schema = {};

    headers.forEach((header) => {
        const headerNorm = normalize(header);
        const isKnownDateHeader = [
            "createdat", "entrytime", "date", "transactiondate", "paymentdate", "timestamp", "updatedat"
        ].includes(headerNorm);

        const isKnownAmountHeader = [
            "amount", "transactionamount", "txnamount", "paymentamount", "orderamount", "settlementamount", "amt", "value", "total", "price"
        ].includes(headerNorm);

        const sampleValues = rows
            .map((r) => r[header])
            .filter((v) => v !== null && v !== undefined && String(v).trim() !== "" && String(v).toUpperCase() !== "NULL")
            .slice(0, 50);

        if (!sampleValues.length) {
            schema[header] = { type: "categorical" };
            return;
        }

        if (isKnownDateHeader) {
            schema[header] = { type: "datetime" };
            return;
        }

        if (isKnownAmountHeader) {
            schema[header] = { type: "numeric" };
            return;
        }

        let numCount = 0;
        let dateCount = 0;

        sampleValues.forEach((val) => {
            const str = String(val).trim();
            const cleanNum = str.replace(/,/g, "").replace(/₹/g, "").replace(/\$/g, "");
            if (cleanNum !== "" && !isNaN(Number(cleanNum))) {
                numCount++;
            }
            if (parseDate(str)) {
                dateCount++;
            }
        });

        if (numCount === sampleValues.length) {
            schema[header] = { type: "numeric" };
        } else if (dateCount >= sampleValues.length * 0.8) {
            schema[header] = { type: "datetime" };
        } else {
            schema[header] = { type: "categorical" };
        }
    });

    return schema;
};