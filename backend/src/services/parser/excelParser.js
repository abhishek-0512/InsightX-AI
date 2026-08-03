const XLSX = require("xlsx");

exports.parse = async (filePath) => {
    const workbook = XLSX.readFile(filePath, {
        cellDates: true
    });

    let targetSheetName = workbook.SheetNames[0];

    const dataSheetNames = ["Raw Data", "DB_Master_Data", "Transactions", "Data"];
    
    for (const name of dataSheetNames) {
        if (workbook.SheetNames.includes(name)) {
            targetSheetName = name;
            break;
        }
    }

    const worksheet = workbook.Sheets[targetSheetName];

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