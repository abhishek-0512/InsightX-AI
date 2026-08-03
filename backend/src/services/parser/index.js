const fs = require("fs");
const path = require("path");
const parserFactory = require("./parserFactory");

exports.parseFile = async (filePath, originalFileName) => {
    if (!fs.existsSync(filePath)) {
        throw new Error("Uploaded file not found.");
    }

    const parser = parserFactory.getParser(originalFileName);

    const rows = await parser.parse(filePath);

    if (!Array.isArray(rows)) {
        throw new Error("Parser must return an array.");
    }

    return {
        fileName: path.basename(originalFileName),
        fileType: path.extname(originalFileName).replace(".", "").toLowerCase(),
        rowCount: rows.length,
        columnCount: rows.length ? Object.keys(rows[0]).length : 0,
        headers: rows.length ? Object.keys(rows[0]) : [],
        rows
    };
};