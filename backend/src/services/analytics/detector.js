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