const fs = require("fs");
const csv = require("csv-parser");

exports.parse = (filePath) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(filePath)
            .pipe(
                csv({
                    mapHeaders: ({ header }) =>
                        header ? header.trim() : header,
                    mapValues: ({ value }) =>
                        typeof value === "string" ? value.trim() : value
                })
            )
            .on("data", (row) => rows.push(row))
            .on("end", () => resolve(rows))
            .on("error", (err) => reject(err));
    });
};