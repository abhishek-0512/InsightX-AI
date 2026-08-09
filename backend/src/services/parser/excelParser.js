const XLSX = require("xlsx");

exports.parse = async (filePath) => {
    const workbook = XLSX.readFile(filePath, {
        cellDates: true
    });

    const sheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: null,
        raw: false
    });

    return rows.map((row) => {
        const cleaned = {};

        Object.keys(row).forEach((key) => {
            const newKey = String(key).trim();
            let value = row[key];

            if (typeof value === "string") {
                value = value.trim();
            }

            cleaned[newKey] = value;
        });

        return cleaned;
    });
};