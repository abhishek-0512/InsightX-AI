const { parseFile } = require("../services/parser");
const analytics = require("../services/analytics");

exports.analyzeFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a CSV or Excel file."
            });
        }

        const parsedData = await parseFile(
            req.file.path,
            req.file.originalname
        );

        const analysis = analytics.analyze(parsedData.rows);

        return res.status(200).json({
            success: true,
            message: "Analysis completed successfully.",

            file: {
                originalName: req.file.originalname,
                savedName: req.file.filename,
                fileType: parsedData.fileType,
                totalRows: parsedData.rowCount,
                totalColumns: parsedData.columnCount
            },

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