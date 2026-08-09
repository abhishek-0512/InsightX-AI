const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const addExecutiveSheet = require("./executiveSheet");
const addMonthlySheet = require("./monthlySheet");
const addDashboardSheet = require("./dashboardSheet");
const addPaymentSheet = require("./paymentSheet");
const addDeviceSheet = require("./deviceSheet");
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

    // 1. Executive Summary
    await addExecutiveSheet(workbook, analysis);

    // 2. Monthly Breakdown Sheet
    if (analysis.monthly?.available || (analysis.monthly?.monthlyList && analysis.monthly.monthlyList.length > 0)) {
        await addMonthlySheet(workbook, analysis);
    }

    // 3. Dashboard Sheet
    await addDashboardSheet(workbook, analysis);

    // 4. Payment Analytics Sheet
    await addPaymentSheet(workbook, analysis);

    // 5. Device & Platform Sheet
    if (analysis.device?.available) {
        await addDeviceSheet(workbook, analysis);
    }

    // 6. Raw Data Sheet
    const rawSheet = workbook.addWorksheet("Raw Data");
    if (rows && rows.length > 0) {
        rawSheet.columns = Object.keys(rows[0]).map((header) => ({
            header,
            key: header,
            width: 22
        }));

        rawSheet.getRow(1).font = {
            bold: true,
            size: 12
        };

        rawSheet.views = [
            { state: "frozen", xSplit: 0, ySplit: 1 }
        ];

        rawSheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: rawSheet.columns.length }
        };

        rows.forEach((row) => rawSheet.addRow(row));
    }

    // 7. Charts Data Sheet
    await addCharts(workbook, analysis);

    // Save Workbook
    const reportName = `${Date.now()}-${path.parse(fileName).name}.xlsx`;
    const reportPath = path.join(REPORT_DIR, reportName);

    await workbook.xlsx.writeFile(reportPath);

    return reportPath;
};