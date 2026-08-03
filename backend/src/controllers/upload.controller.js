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

        // ===========================================
        // Parse Uploaded File
        // ===========================================

        const parsed = await parseFile(
            req.file.path,
            req.file.originalname
        );

        // ===========================================
        // DEBUG DATASET
        // ===========================================

        console.log("\n================ FIRST ROW ================\n");

        console.log(parsed.rows[0]);

        console.log("\n================ HEADERS ==================\n");

        console.log(Object.keys(parsed.rows[0]));

        console.log("\n============= FIRST 5 ROWS ================\n");

        console.table(parsed.rows.slice(0, 5));

        // ===========================================
        // Save Dataset in MySQL
        // ===========================================

        const tableName =
            path.parse(req.file.originalname).name
                .replace(/[^a-zA-Z0-9]/g, "_")
                .toLowerCase() +
            "_" +
            Date.now();

        await importDataset(tableName, parsed.rows);

        // ===========================================
        // Generate Analytics
        // ===========================================

        const analysis = analytics.analyze(parsed.rows);

        console.log("\n=============== ANALYSIS ==================\n");

        console.log(JSON.stringify(analysis, null, 2));

        // ===========================================
        // Generate Excel Report
        // ===========================================

        const absoluteReportPath = await generateWorkbook({

            fileName: req.file.originalname,

            rows: parsed.rows,

            analysis

        });

        console.log("\n============= REPORT CREATED ==============\n");

        console.log(absoluteReportPath);

        // ===========================================
        // Convert Absolute Path -> URL
        // ===========================================

        const reportFile = path.basename(
            absoluteReportPath
        );

        const reportPath = `/reports/${reportFile}`;

        // ===========================================
        // Response
        // ===========================================

        return res.status(200).json({

            success: true,

            message: "Dataset analyzed successfully.",

            reportPath,

            analysis

        });

    } catch (error) {

        console.error("\n============= SERVER ERROR =============");

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};