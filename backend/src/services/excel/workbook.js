const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const addExecutiveSheet = require("./executiveSheet");
const addMonthlySheet = require("./monthlySheet");
const addDashboardSheet = require("./dashboardSheet");
const addPaymentSheet = require("./paymentSheet");
const addCharts = require("./charts");

const REPORT_DIR = path.join(__dirname, "../../reports");

if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
}

exports.generateWorkbook = async ({
    fileName,
    rows,
    analysis
}) => {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "InsightX AI";
    workbook.company = "PayVista";
    workbook.subject = "Payment Analytics Report";
    workbook.title = "InsightX AI Business Report";
    workbook.created = new Date();
    workbook.modified = new Date();

    // ====================================================
    // Executive Summary (First Sheet)
    // ====================================================
    await addExecutiveSheet(workbook, analysis);

    // ====================================================
    // Monthly Breakdown Sheet (NEW)
    // ====================================================
    if (analysis.monthly?.available) {
        await addMonthlySheet(workbook, analysis);
    }

    // ====================================================
    // Dashboard
    // ====================================================
    await addDashboardSheet(workbook, analysis);

    // ====================================================
    // Payment Report
    // ====================================================
    await addPaymentSheet(workbook, analysis);

    // ====================================================
    // Raw Dataset
    // ====================================================
    const rawSheet = workbook.addWorksheet("Raw Data");

    if (rows && rows.length) {
        rawSheet.columns = Object.keys(rows[0]).map((header) => ({
            header,
            key: header,
            width: 22
        }));

        rawSheet.getRow(1).font = {
            bold: true,
            size: 12
        };

        rows.forEach((row) => rawSheet.addRow(row));
    }

    // ====================================================
    // Charts
    // ====================================================
    await addCharts(workbook, analysis);

    // ====================================================
    // Save Report
    // ====================================================
    const reportName = `${Date.now()}-${path.parse(fileName).name}.xlsx`;
    const reportPath = path.join(REPORT_DIR, reportName);

    await workbook.xlsx.writeFile(reportPath);

    return reportPath;
};