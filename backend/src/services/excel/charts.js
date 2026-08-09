module.exports = async (workbook, analysis) => {

    const sheet = workbook.addWorksheet("Charts");

    sheet.columns = [
        { header: "Category", width: 30 },
        { header: "Value", width: 20 }
    ];

    // =====================================================
    // Payment Modes
    // =====================================================

    sheet.addRow(["Payment Modes", ""]);

    const paymentModes =
        analysis.payment?.paymentModes || {};

    Object.entries(paymentModes).forEach(
        ([mode, count]) => {

            sheet.addRow([
                mode,
                count
            ]);

        }
    );

    sheet.addRow([]);

    // =====================================================
    // Monthly Revenue
    // =====================================================

    sheet.addRow(["Monthly Revenue", ""]);

    const monthly =
        analysis.monthly?.monthly || {};

    Object.entries(monthly).forEach(
        ([month, value]) => {

            sheet.addRow([
                month,
                value.amount
            ]);

        }
    );

    sheet.addRow([]);

    // =====================================================
    // Device Distribution
    // =====================================================

    sheet.addRow(["Device Distribution", ""]);

    const devices =
        analysis.device?.devices || {};

    Object.entries(devices).forEach(
        ([device, count]) => {

            sheet.addRow([
                device,
                count
            ]);

        }
    );

    sheet.addRow([]);

    // =====================================================
    // Location Distribution
    // =====================================================

    sheet.addRow(["Top Locations", ""]);

    const locations =
        analysis.location?.cities || {};

    Object.entries(locations).forEach(
        ([city, count]) => {

            sheet.addRow([
                city,
                count
            ]);

        }
    );

    sheet.getRow(1).font = {
        bold: true
    };

    sheet.eachRow((row) => {

        row.eachCell((cell) => {

            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };

        });

    });

};