const normalize = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_\-]/g, "");

exports.getValue = (row, possibleKeys) => {

    const keys = Object.keys(row);

    for (const expected of possibleKeys) {

        const normalized = normalize(expected);

        const matched = keys.find(
            key => normalize(key) === normalized
        );

        if (matched) {
            return row[matched];
        }

    }

    return null;

};

exports.hasColumn = (rows, possibleKeys) => {

    if (!rows.length) {
        return false;
    }

    return exports.getValue(rows[0], possibleKeys) !== null;

};