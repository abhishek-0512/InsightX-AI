const styles = require("./styles");

module.exports = async (workbook, analysis) => {
    const sheet = workbook.addWorksheet("Charts");

    sheet.columns = [
        { header: "Category", key: "category", width: 35 },
        { header: "Value", key: "value", width: 25 }
    ];

    const mainHeaderRow = sheet.getRow(1);
    styles.headerStyle(mainHeaderRow.getCell(1));
    styles.headerStyle(mainHeaderRow.getCell(2));

    const addSection = (title, data, isAmount = false) => {
        if (!data || Object.keys(data).length === 0) return;

        const headerRow = sheet.addRow([title, ""]);
        headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
        headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: styles.colors.secondary } };

        Object.entries(data).forEach(([key, val]) => {
            const displayValue = isAmount ? (val?.amount || 0) : val;
            const dataRow = sheet.addRow([key, displayValue]);

            if (isAmount) {
                dataRow.getCell(2).numFmt = '₹#,##0.00';
            }
        });

        sheet.addRow([]);
    };

    // =====================================================
    // Populate Sections
    // =====================================================

    addSection("Payment Modes", analysis.payment?.paymentModes || {});
    addSection("Monthly Revenue", analysis.monthly?.monthly || {}, true);
    addSection("Device Distribution", analysis.device?.devices || analysis.device?.operatingSystems || {});
    addSection("Top Locations", analysis.location?.cities || {});

    // =====================================================
    // Global Styling
    // =====================================================

    sheet.eachRow((row) => {
        if (row.hasValues) {
            row.eachCell({ includeEmpty: false }, (cell) => {
                // Skip borders for the blank spacer rows that just have an empty value
                if (cell.value !== "") {
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" }
                    };
                }
            });
        }
    });
};