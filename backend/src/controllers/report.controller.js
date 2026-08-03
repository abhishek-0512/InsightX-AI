const fs = require("fs");
const { parseFile } = require("../services/parser");
const analytics = require("../services/analytics");
const workbook = require("../services/excel/workbook");

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

        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.download(reportPath, (err) => {
            if (err) {
                console.error("File download error:", err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: "Error downloading the file."
                    });
                }
            }
        });

    } catch (error) {
        console.error("Report generation error:", error);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate report"
        });
    }
};