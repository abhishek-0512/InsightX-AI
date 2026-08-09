/**
 * Pure zero-dependency CSV parser for browser environments
 */
export function parseCSVText(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (!lines.length) return [];

    // Parse CSV line taking quotes into account
    const parseLine = (line) => {
        const result = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
                if (inQuotes && line[i + 1] === char) {
                    current += char;
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if ((char === "," || char === "\t" || char === ";") && !inQuotes) {
                result.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    const headers = parseLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        if (values.length === 0 || (values.length === 1 && values[0] === "")) continue;

        const row = {};
        headers.forEach((header, idx) => {
            row[header] = values[idx] !== undefined ? values[idx] : "";
        });
        rows.push(row);
    }

    return rows;
}

/**
 * Parses CSV, XLS, or XLSX file in the browser
 * Returns a Promise that resolves to an array of row objects
 */
export async function parseFileInBrowser(file) {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".csv")) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const rows = parseCSVText(text);
                    if (rows && rows.length) {
                        resolve(rows);
                    } else {
                        reject(new Error("No data rows found in CSV file."));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
        });
    }

    if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) {
        // Dynamic import for XLSX
        try {
            const XLSX = await import("xlsx");
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: "array" });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                        if (json && json.length) {
                            resolve(json);
                        } else {
                            reject(new Error("No data found in Excel spreadsheet."));
                        }
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = (err) => reject(err);
                reader.readAsArrayBuffer(file);
            });
        } catch (importErr) {
            console.warn("XLSX library not bundled, attempting text read fallback:", importErr.message);
            // Text fallback
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const text = e.target.result;
                        const rows = parseCSVText(text);
                        if (rows && rows.length) resolve(rows);
                        else reject(new Error("Please convert your XLS file to CSV for optimal browser compatibility."));
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = (err) => reject(err);
                reader.readAsText(file);
            });
        }
    }

    throw new Error("Unsupported file format. Please upload CSV, XLS, or XLSX.");
}
