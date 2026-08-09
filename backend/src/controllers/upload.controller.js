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

        // Try storing data in MySQL (non-blocking if DB is offline)
        try {
            const tableName =
                path.parse(req.file.originalname).name
                    .replace(/[^a-zA-Z0-9]/g, "_")
                    .toLowerCase() +
                "_" +
                Date.now();

            await importDataset(tableName, parsed.rows);
        } catch (dbErr) {
            console.warn("⚠️ MySQL storage skipped or failed:", dbErr.message);
        }

        // Generate full dataset analytics
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
            analysis,
            rows: parsed.rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};