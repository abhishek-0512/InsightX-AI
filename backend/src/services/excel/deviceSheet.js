const {
    applySheetTitle,
    applySectionHeader,
    applyTableHeaders,
    applyZebraStriping,
    applyTotalRowStyle,
    numberStyle,
    autoFitColumns
} = require("./styles");

module.exports = async (workbook, analysis) => {
    const devices = analysis.device?.devices || {};
    if (!Object.keys(devices).length) return;

    const sheet = workbook.addWorksheet("Device & Platform");

    // Title Banner
    applySheetTitle(
        sheet,
        "Device & Operating System Distribution",
        "Customer platform usage, device split, and transaction velocity",
        4
    );

    sheet.addRow([]);

    // Table Header
    applySectionHeader(sheet, 4, "1. PLATFORM / DEVICE SUMMARY", 4);
    const headerRow = sheet.addRow(["Device / Platform", "Transaction Count", "Platform Share (%)", "Status"]);
    applyTableHeaders(headerRow, ["Device / Platform", "Transaction Count", "Platform Share (%)", "Status"]);

    const startRow = sheet.lastRow.number + 1;
    const totalTx = analysis.payment?.overview?.totalTransactions || 1;

    let totalCount = 0;
    Object.entries(devices)
        .sort((a, b) => b[1] - a[1])
        .forEach(([device, count]) => {
            totalCount += count;
            const share = Number(((count / totalTx) * 100).toFixed(2));
            const row = sheet.addRow([device, count, `${share}%`, "Active"]);
            numberStyle(row.getCell(2));
        });

    applyZebraStriping(sheet, startRow, sheet.lastRow.number);

    const totalRow = sheet.addRow(["Total All Devices", totalCount, "100.00%", ""]);
    numberStyle(totalRow.getCell(2));
    applyTotalRowStyle(totalRow, 4);

    autoFitColumns(sheet);
};
