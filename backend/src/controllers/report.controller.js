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

        return res.download(reportPath);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
