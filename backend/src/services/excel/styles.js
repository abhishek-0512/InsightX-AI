const colors = {
    navyDark: "0F172A",
    navyMedium: "1E293B",
    navyLight: "334155",
    primary: "0284C7",
    primaryLight: "E0F2FE",
    success: "059669",
    danger: "DC2626",
    warning: "D97706",
    zebra: "F8FAFC",
    white: "FFFFFF",
    totalRow: "E2E8F0",
    borderLight: "E2E8F0",
    borderMedium: "CBD5E1",
    borderDark: "94A3B8",
    textDark: "0F172A",
    textWhite: "FFFFFF"
};

exports.colors = colors;

exports.applySheetTitle = (sheet, titleText, subtitleText = "", colSpan = 8) => {
    const endColLetter = String.fromCharCode(65 + colSpan - 1);
    sheet.mergeCells(`A1:${endColLetter}1`);
    const titleCell = sheet.getCell("A1");
    titleCell.value = titleText;
    titleCell.font = { name: "Segoe UI", size: 15, bold: true, color: { argb: colors.textWhite } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navyDark } };
    titleCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    sheet.getRow(1).height = 34;

    if (subtitleText) {
        sheet.mergeCells(`A2:${endColLetter}2`);
        const subCell = sheet.getCell("A2");
        subCell.value = subtitleText;
        subCell.font = { name: "Segoe UI", size: 10, italic: true, color: { argb: "94A3B8" } };
        subCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navyMedium } };
        subCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
        sheet.getRow(2).height = 22;
    }
};

exports.applyTableHeaders = (row, titles = []) => {
    titles.forEach((title, idx) => {
        const cell = row.getCell(idx + 1);
        cell.value = title;
        cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: colors.textWhite } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navyDark } };
        cell.alignment = { horizontal: idx === 0 ? "left" : "right", vertical: "middle" };
        cell.border = {
            top: { style: "medium", color: { argb: colors.navyLight } },
            bottom: { style: "medium", color: { argb: colors.navyLight } },
            left: { style: "thin", color: { argb: colors.navyLight } },
            right: { style: "thin", color: { argb: colors.navyLight } }
        };
    });
    row.height = 26;
};

exports.applySectionHeader = (sheet, rowNumber, title, colSpan = 6) => {
    const endCol = String.fromCharCode(65 + colSpan - 1);
    sheet.mergeCells(`A${rowNumber}:${endCol}${rowNumber}`);
    const cell = sheet.getCell(`A${rowNumber}`);
    cell.value = title;
    cell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: colors.textWhite } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.primary } };
    cell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    sheet.getRow(rowNumber).height = 24;
};

exports.applyZebraStriping = (sheet, startRow, endRow) => {
    for (let r = startRow; r <= endRow; r++) {
        const row = sheet.getRow(r);
        const isEven = (r - startRow) % 2 === 1;
        const bgColor = isEven ? colors.zebra : colors.white;

        row.eachCell({ includeEmpty: false }, (cell) => {
            if (!cell.fill || cell.fill.type !== "pattern") {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
            }
            cell.font = { name: "Segoe UI", size: 10, ...(cell.font || {}) };
            cell.border = {
                top: { style: "thin", color: { argb: colors.borderLight } },
                bottom: { style: "thin", color: { argb: colors.borderLight } },
                left: { style: "thin", color: { argb: colors.borderLight } },
                right: { style: "thin", color: { argb: colors.borderLight } }
            };
        });
        if (!row.height) row.height = 22;
    }
};

exports.applyTotalRowStyle = (row, colCount = 8) => {
    row.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: colors.navyDark } };
    for (let c = 1; c <= colCount; c++) {
        const cell = row.getCell(c);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.totalRow } };
        cell.border = {
            top: { style: "thin", color: { argb: colors.borderDark } },
            bottom: { style: "double", color: { argb: colors.navyDark } },
            left: { style: "thin", color: { argb: colors.borderMedium } },
            right: { style: "thin", color: { argb: colors.borderMedium } }
        };
    }
    row.height = 26;
};

exports.currencyStyle = (cell) => {
    cell.numFmt = "₹#,##0.00";
    cell.alignment = { horizontal: "right", vertical: "middle" };
};

exports.numberStyle = (cell) => {
    cell.numFmt = "#,##0";
    cell.alignment = { horizontal: "right", vertical: "middle" };
};

exports.percentStyle = (cell) => {
    cell.numFmt = "0.00%";
    cell.alignment = { horizontal: "right", vertical: "middle" };
};

exports.titleStyle = (cell) => {
    cell.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: colors.textWhite } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navyDark } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
};

exports.headerStyle = (cell) => {
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: colors.textWhite } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navyDark } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
        top: { style: "thin", color: { argb: colors.navyLight } },
        left: { style: "thin", color: { argb: colors.navyLight } },
        bottom: { style: "thin", color: { argb: colors.navyLight } },
        right: { style: "thin", color: { argb: colors.navyLight } }
    };
};

exports.autoFitColumns = (worksheet) => {
    worksheet.views = [{ showGridLines: true }];
    worksheet.columns.forEach((column) => {
        let max = 14;
        column.eachCell({ includeEmpty: false }, (cell) => {
            const val = cell.value ? String(cell.value) : "";
            if (val.length > max) max = val.length;
        });
        column.width = Math.min(Math.max(max + 4, 16), 45);
    });
};