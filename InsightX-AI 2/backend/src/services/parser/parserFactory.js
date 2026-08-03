const path = require("path");

const csvParser = require("./csvParser");
const excelParser = require("./excelParser");

const parsers = {
    ".csv": csvParser,
    ".xlsx": excelParser,
    ".xls": excelParser
};

exports.getParser = (fileName) => {
    const extension = path.extname(fileName).toLowerCase();

    const parser = parsers[extension];

    if (!parser) {
        throw new Error(
            `Unsupported file type "${extension}". Supported formats: .csv, .xlsx, .xls`
        );
    }

    return parser;
};