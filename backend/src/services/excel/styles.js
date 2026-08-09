const ExcelJS = require("exceljs");

const colors = {
    primary: "2563EB",
    secondary: "1E293B",
    success: "16A34A",
    danger: "DC2626",
    warning: "F59E0B",
    info: "0891B2",
    light: "F8FAFC",
    border: "CBD5E1"
};

exports.colors = colors;

exports.titleStyle = (cell) => {
    cell.font = {
        name: "Calibri",
        size: 18,
        bold: true,
        color: { argb: "FFFFFF" }
    };
    cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colors.primary }
    };
    cell.alignment = {
        horizontal: "center",
        vertical: "middle"
    };
};

exports.headerStyle = (cell) => {
    cell.font = {
        bold: true,
        color: { argb: "FFFFFF" }
    };
    cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colors.secondary }
    };
    cell.alignment = {
        horizontal: "center",
        vertical: "middle"
    };
    cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
    };
};

exports.currencyStyle = (cell) => {
    cell.numFmt = "₹#,##0.00";
};

exports.percentStyle = (cell) => {
    cell.numFmt = "0.00%";
};

exports.successStyle = (cell) => {
    cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colors.success }
    };
    cell.font = {
        bold: true,
        color: { argb: "FFFFFF" }
    };
};

exports.dangerStyle = (cell) => {
    cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colors.danger }
    };
    cell.font = {
        bold: true,
        color: { argb: "FFFFFF" }
    };
};

exports.autoFitColumns = (worksheet) => {
    worksheet.columns.forEach((column) => {
        let max = 15;
        column.eachCell({ includeEmpty: true }, (cell) => {
            const len = cell.value ? cell.value.toString().length : 10;
            if (len > max) {
                max = len;
            }
        });
        column.width = Math.min(max + 3, 40);
    });
};