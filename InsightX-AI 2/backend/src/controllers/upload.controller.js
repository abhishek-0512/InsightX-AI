const path = require("path");

const { parseFile } = require("../services/parser");
const analytics = require("../services/analytics");
const { generateWorkbook } = require("../services/excel/workbook");
const { importDataset } = require("../config/db");

exports.uploadFile = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a CSV or Excel file."
            });
        }

        // Parse uploaded file
        const parsed = await parseFile(
            req.file.path,
            req.file.originalname
        );

        // Create unique table name
        const tableName =
            path.parse(req.file.originalname).name
                .replace(/[^a-zA-Z0-9]/g, "_")
                .toLowerCase() +
            "_" +
            Date.now();

        // Store data in MySQL
        await importDataset(tableName, parsed.rows);

        // Generate analytics
        const analysis = analytics.analyze(parsed.rows);

        // Generate Excel report
        const reportPath = await generateWorkbook({
            fileName: req.file.originalname,
            rows: parsed.rows,
            analysis
        });

        return res.status(200).json({
            success: true,
            message: "Dataset analyzed successfully.",
            reportPath: reportPath.replace(/\\/g, "/"),
            analysis
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};