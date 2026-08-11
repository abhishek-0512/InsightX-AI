const {
    applySheetTitle,
    applySectionHeader,
    applyTableHeaders,
    applyZebraStriping,
    currencyStyle,
    numberStyle,
    autoFitColumns
} = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Charts Data");

    // ---------- Sheet Title Banner ----------
    applySheetTitle(
        sheet,
        "InsightX AI — Visual Charts & Aggregation Data",
        "Source tables for executive dashboards, visual charts, and distributions",
        4
    );

    sheet.addRow([]);

    // ================= 1. Payment Channel Distribution =================
    let currRow = 4;
    applySectionHeader(sheet, currRow, "1. PAYMENT CHANNELS", 4);

    const pHeader = sheet.addRow(["Payment Mode", "Transaction Count", "Share (%)", ""]);
    applyTableHeaders(pHeader, ["Payment Mode", "Transaction Count", "Share (%)", ""]);

    const pStart = sheet.lastRow.number + 1;
    const paymentModes = analysis.payment?.paymentModes || {};
    const totalTx = analysis.payment?.overview?.totalTransactions || 1;

    Object.entries(paymentModes).forEach(([mode, count]) => {
        const share = Number(((count / totalTx) * 100).toFixed(2));
        const row = sheet.addRow([mode, count, `${share}%`, ""]);
        numberStyle(row.getCell(2));
    });

    applyZebraStriping(sheet, pStart, sheet.lastRow.number);

    // ================= 2. Monthly Revenue Velocity =================
    sheet.addRow([]);
    currRow = sheet.lastRow.number + 1;
    applySectionHeader(sheet, currRow, "2. MONTHLY REVENUE VELOCITY", 4);

    const mHeader = sheet.addRow(["Month", "Net Revenue (₹)", "Gross Revenue (₹)", "Volume"]);
    applyTableHeaders(mHeader, ["Month", "Net Revenue (₹)", "Gross Revenue (₹)", "Volume"]);

    const mStart = sheet.lastRow.number + 1;
    const monthlyList = analysis.monthly?.monthlyList || [];

    monthlyList.forEach((m) => {
        const row = sheet.addRow([
            m.month,
            m.netAmount,
            m.grossAmount,
            m.transactions
        ]);
        currencyStyle(row.getCell(2));
        currencyStyle(row.getCell(3));
        numberStyle(row.getCell(4));
    });

    applyZebraStriping(sheet, mStart, sheet.lastRow.number);

    // ================= 3. Platform Distribution =================
    if (analysis.device && analysis.device.available) {
        sheet.addRow([]);
        currRow = sheet.lastRow.number + 1;
        applySectionHeader(sheet, currRow, "3. DEVICE & PLATFORM DISTRIBUTION", 4);

        const dHeader = sheet.addRow(["Device / OS", "User Count", "Share (%)", ""]);
        applyTableHeaders(dHeader, ["Device / OS", "User Count", "Share (%)", ""]);

        const dStart = sheet.lastRow.number + 1;
        const devices = analysis.device?.devices || {};

        Object.entries(devices).forEach(([device, count]) => {
            const share = Number(((count / totalTx) * 100).toFixed(2));
            const row = sheet.addRow([device, count, `${share}%`, ""]);
            numberStyle(row.getCell(2));
        });

        applyZebraStriping(sheet, dStart, sheet.lastRow.number);
    }

    autoFitColumns(sheet);
};