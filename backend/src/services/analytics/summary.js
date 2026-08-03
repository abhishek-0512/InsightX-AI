const detector = require("../parser/detector");

exports.generateSummary = (rows = []) => {
    const rowCount = rows.length;

    const headers = rowCount ? Object.keys(rows[0]) : [];

    const columnCount = headers.length;

    const schema = detector.detectSchema(rows);

    let missingValues = 0;
    let duplicateRows = 0;
    let emptyColumns = 0;

    const uniqueRows = new Set();

    rows.forEach((row) => {
        const serialized = JSON.stringify(row);

        if (uniqueRows.has(serialized)) {
            duplicateRows++;
        } else {
            uniqueRows.add(serialized);
        }
    });

    headers.forEach((header) => {
        const values = rows.map((row) => row[header]);

        const missing = values.filter(
            (v) =>
                v === null ||
                v === undefined ||
                String(v).trim() === ""
        ).length;

        missingValues += missing;

        if (missing === rowCount) {
            emptyColumns++;
        }
    });

    return {
        dataset: {
            totalRows: rowCount,
            totalColumns: columnCount,
            headers
        },

        quality: {
            missingValues,
            duplicateRows,
            emptyColumns,
            completeness:
                rowCount && columnCount
                    ? (
                          (
                              (rowCount * columnCount - missingValues) /
                              (rowCount * columnCount)
                          ) *
                          100
                      ).toFixed(2)
                    : 0
        },

        schema
    };
};