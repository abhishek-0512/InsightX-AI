const path = require("path");
const fs = require("fs");
const { parseFile } = require("../services/parser");
const analytics = require("../services/analytics");
const workbook = require("../services/excel/workbook");

const REPORT_DIR = path.join(__dirname, "../../reports");

exports.generateReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file."
            });
        }

        const parsed = await parseFile(
            req.file.path,
            req.file.originalname
        );

        const analysis = analytics.analyze(parsed.rows);

        const reportPath = await workbook.generateWorkbook({
            fileName: req.file.originalname,
            rows: parsed.rows,
            analysis
        });

        return res.download(reportPath);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Downloads a generated report by filename from the reports directory
 */
exports.downloadReportByName = async (req, res) => {
    try {
        const { filename } = req.params;
        if (!filename) {
            return res.status(400).json({ success: false, message: "Filename required" });
        }

        const safeFilename = path.basename(filename);
        const filePath = path.join(REPORT_DIR, safeFilename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "Report file not found or has expired. Please re-generate."
            });
        }

        res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return res.sendFile(filePath);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Dynamically exports Excel workbook from dataset rows and analysis payload
 */
exports.exportDynamicReport = async (req, res) => {
    try {
        const { fileName, rows, analysis } = req.body;
        const targetRows = Array.isArray(rows) ? rows : [];
        const targetAnalysis = analysis || analytics.analyze(targetRows);

        const reportPath = await workbook.generateWorkbook({
            fileName: fileName || "Analytics_Report.xlsx",
            rows: targetRows,
            analysis: targetAnalysis
        });

        const reportFileName = path.basename(reportPath);
        res.setHeader("Content-Disposition", `attachment; filename="${reportFileName}"`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return res.sendFile(reportPath);
    } catch (error) {
        console.error("Export report error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
