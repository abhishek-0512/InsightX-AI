exports.analyze = (rows = []) => {
    if (!rows.length) {
        return {
            totalRows: 0,
            duplicateRows: 0,
            missingValues: 0,
            emptyRows: 0,
            emptyColumns: [],
            completeness: 0
        };
    }

    const headers = Object.keys(rows[0]);

    let missingValues = 0;
    let emptyRows = 0;

    const duplicateSet = new Set();
    let duplicateRows = 0;

    const emptyColumns = [];

    rows.forEach((row) => {
        const key = JSON.stringify(row);

        if (duplicateSet.has(key)) {
            duplicateRows++;
        } else {
            duplicateSet.add(key);
        }

        let rowEmpty = true;

        headers.forEach((column) => {
            const value = row[column];

            if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            ) {
                missingValues++;
            } else {
                rowEmpty = false;
            }
        });

        if (rowEmpty) {
            emptyRows++;
        }
    });

    headers.forEach((column) => {
        const isEmpty = rows.every((row) => {
            const value = row[column];

            return (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            );
        });

        if (isEmpty) {
            emptyColumns.push(column);
        }
    });

    const totalCells = rows.length * headers.length;
    const filledCells = totalCells - missingValues;

    return {
        totalRows: rows.length,
        totalColumns: headers.length,

        duplicateRows,
        missingValues,
        emptyRows,
        emptyColumns,

        completeness: Number(
            ((filledCells / totalCells) * 100).toFixed(2)
        ),

        filledCells,
        totalCells
    };
};