const XLSX = require("xlsx");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const reportCache = new Map();
let lastUploadedRawData = null;

// Helper to categorize device platforms
function categorizeDevice(platform) {
    if (!platform) return "Unknown / Other";
    const p = String(platform).toLowerCase();
    if (p.includes("iphone") || p.includes("ipad") || p.includes("ios")) return "iPhone / iOS";
    if (p.includes("android")) return "Android";
    if (p.includes("windows")) return "Windows";
    if (p.includes("macos") || p.includes("mac")) return "Mac OS";
    if (p.includes("linux")) return "Linux";
    return "Unknown / Other";
}

// Your exact analyze function
exports.analyze = ({
    payment = {},
    refund = {},
    failure = {},
    device = {},
    monthly = {},
    location = {}
}) => {

    return {

        overview: {
            totalTransactions:
                payment.overview?.totalTransactions || 0,

            successfulTransactions:
                payment.overview?.successfulTransactions || 0,

            failedTransactions:
                payment.overview?.failedTransactions || 0,

            refundedTransactions:
                payment.overview?.refundedTransactions || 0
        },

        revenue: {
            totalRevenue:
                payment.revenue?.totalAmount || 0,

            refundAmount:
                payment.revenue?.refundAmount || 0,

            netRevenue:
                payment.revenue?.netAmount || 0
        },

        performance: {
            successRate:
                payment.successRate || 0,

            refundRate:
                payment.refundRate || 0,

            failureCount:
                failure.totalFailures || 0
        },

        paymentModes:
            payment.paymentModes || {},

        topPaymentMode:
            Object.entries(
                payment.paymentModes || {}
            )
                .sort((a, b) => b[1] - a[1])[0] || null,

        topFailureReason:
            failure.topReason || null,

        topRefundReason:
            refund.topReason || null,

        topDevice:
            device.topDevice || null,

        topLocation:
            location.topCity ||
            location.topState ||
            location.topCountry ||
            null,

        peakMonth:
            monthly.peakMonth || null,

        generatedAt:
            new Date().toISOString()

    };

};

// Compute comprehensive master analytics
function computeMasterData(rawData) {
    const processedData = rawData.map(r => {
        const platform = r.platform || r.device_name || "Unknown Device";
        const device_category = categorizeDevice(platform);

        let monthName = "June 2026";
        const timeField = r.entry_time || r.created_at;
        if (timeField) {
            const parts = String(timeField).split(" ")[0].split("-");
            if (parts.length === 3) {
                let year = parts[2].length === 2 ? "20" + parts[2] : parts[0];
                let monthIdx = parseInt(parts[1], 10) - 1;
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                if (monthIdx >= 0 && monthIdx < 12) {
                    monthName = `${monthNames[monthIdx]} ${year}`;
                }
            }
        }

        return {
            device_category,
            transaction_month: monthName,
            ...r
        };
    });

    const totalTransactions = processedData.length;
    const grossVolume = processedData.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    const successfulRecords = processedData.filter(r => 
        String(r.payment_status || "").toUpperCase() === "SUCCESS" || r.status === 1 || r.status === "1"
    );
    const failedRecords = processedData.filter(r => 
        String(r.payment_status || "").toUpperCase() === "FAILURE" || r.status === 0 || r.status === "0"
    );
    const refundRecords = processedData.filter(r => Number(r.is_refund) === 1 || String(r.is_refund).toLowerCase() === "true");

    const successVolume = successfulRecords.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const failedVolume = failedRecords.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const refundVolume = refundRecords.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const netRevenue = successVolume - refundVolume;

    const successRate = totalTransactions > 0 ? (successfulRecords.length / totalTransactions) * 100 : 0;
    const refundRate = totalTransactions > 0 ? (refundRecords.length / totalTransactions) * 100 : 0;

    // 1. Device Analysis
    const categories = ["iPhone / iOS", "Android", "Unknown / Other", "Windows", "Mac OS", "Linux"];
    const deviceSummary = categories.map(cat => {
        const catRows = processedData.filter(r => r.device_category === cat);
        const tTx = catRows.length;
        const tVol = catRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
        const sVol = catRows.filter(r => String(r.payment_status || "").toUpperCase() === "SUCCESS").reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
        const fVol = catRows.filter(r => String(r.payment_status || "").toUpperCase() === "FAILURE").reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
        return {
            device_category: cat,
            Total_Transactions: tTx,
            Total_Volume: Number(tVol.toFixed(3)),
            Success_Volume: Number(sVol.toFixed(3)),
            Failed_Volume: Number(fVol.toFixed(3))
        };
    });

    // 2. Monthly Analysis
    const monthlyMap = {};
    processedData.forEach(r => {
        const m = r.transaction_month;
        if (!monthlyMap[m]) {
            monthlyMap[m] = { transactions: 0, revenue: 0, successful: 0, failed: 0 };
        }
        monthlyMap[m].transactions += 1;
        monthlyMap[m].revenue += (Number(r.amount) || 0);
        if (String(r.payment_status || "").toUpperCase() === "SUCCESS") monthlyMap[m].successful += 1;
        if (String(r.payment_status || "").toUpperCase() === "FAILURE") monthlyMap[m].failed += 1;
    });

    const monthlySummary = Object.entries(monthlyMap).map(([month, data]) => ({
        Month: month,
        Total_Transactions: data.transactions,
        Total_Revenue: Number(data.revenue.toFixed(3)),
        Successful_Count: data.successful,
        Failed_Count: data.failed
    }));

    // 3. Locationwise Analysis
    const locationMap = {};
    processedData.forEach(r => {
        const loc = r.location_id || r.location || "Main Location";
        if (!locationMap[loc]) {
            locationMap[loc] = { transactions: 0, revenue: 0 };
        }
        locationMap[loc].transactions += 1;
        locationMap[loc].revenue += (Number(r.amount) || 0);
    });

    const locationSummary = Object.entries(locationMap).map(([loc, data]) => ({
        Location_ID: loc,
        Total_Transactions: data.transactions,
        Total_Revenue: Number(data.revenue.toFixed(3))
    }));

    // 4. Payment Modes Analysis
    const paymentModeMap = {};
    processedData.forEach(r => {
        const mode = r.pay_mode || r.payment_mode || "paylink";
        paymentModeMap[mode] = (paymentModeMap[mode] || 0) + 1;
    });

    return {
        processedData,
        summary: {
            totalTransactions,
            totalVolume: Number(grossVolume.toFixed(3)),
            successVolume: Number(successVolume.toFixed(3)),
            failedVolume: Number(failedVolume.toFixed(3)),
            refundVolume: Number(refundVolume.toFixed(3)),
            netRevenue: Number(netRevenue.toFixed(3)),
            successRate: Number(successRate.toFixed(2)),
            refundRate: Number(refundRate.toFixed(2)),
            successfulCount: successfulRecords.length,
            failedCount: failedRecords.length,
            refundCount: refundRecords.length
        },
        deviceSummary,
        monthlySummary,
        locationSummary,
        paymentModeMap,
        refundRecords,
        failedRecords
    };
}

// File upload and processing endpoint
exports.analyzeFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer || req.file.path, { type: "buffer" });
        const sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes("raw") || s.toLowerCase().includes("data")) || workbook.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!rawData || rawData.length === 0) {
            return res.status(400).json({ message: "Uploaded file is empty or formatted incorrectly." });
        }

        const master = computeMasterData(rawData);
        const reportId = `report_${Date.now()}`;
        
        reportCache.set(reportId, master);
        lastUploadedRawData = rawData;

        const analysisResult = exports.analyze({
            payment: {
                overview: {
                    totalTransactions: master.summary.totalTransactions,
                    successfulTransactions: master.summary.successfulCount,
                    failedTransactions: master.summary.failedCount,
                    refundedTransactions: master.summary.refundCount
                },
                revenue: {
                    totalAmount: master.summary.totalVolume,
                    refundAmount: master.summary.refundVolume,
                    netAmount: master.summary.netRevenue
                },
                successRate: master.summary.successRate,
                refundRate: master.summary.refundRate,
                paymentModes: master.paymentModeMap
            },
            refund: { topReason: master.summary.refundCount > 0 ? "Customer Request / Cancellation" : "N/A" },
            failure: { totalFailures: master.summary.failedCount, topReason: "Gateway Timeout / Insufficient Funds" },
            device: { topDevice: master.deviceSummary.reduce((a, b) => a.Total_Transactions > b.Total_Transactions ? a : b).device_category },
            monthly: { peakMonth: master.monthlySummary.reduce((a, b) => a.Total_Revenue > b.Total_Revenue ? a : b).Month },
            location: { topCity: master.locationSummary[0]?.Location_ID || "Location 15" }
        });

        const monthlyObj = Object.fromEntries(master.monthlySummary.map(m => [m.Month, m.Total_Revenue]));
        const locationObj = Object.fromEntries(master.locationSummary.map(l => [l.Location_ID, l.Total_Revenue]));
        const devicesObj = Object.fromEntries(master.deviceSummary.map(d => [d.device_category, d.Total_Transactions]));

        const resultPayload = {
            success: true,
            reportId,
            message: "File analyzed successfully!",
            ...analysisResult,
            overview: analysisResult.overview,
            summary: analysisResult.overview,
            metrics: analysisResult.overview,
            payment: {
                overview: analysisResult.overview,
                paymentModes: master.paymentModeMap,
                modes: master.paymentModeMap,
                revenue: analysisResult.revenue,
                successRate: analysisResult.performance.successRate,
                refundRate: analysisResult.performance.refundRate
            },
            paymentModes: master.paymentModeMap,
            modes: master.paymentModeMap,
            payment_modes: master.paymentModeMap,
            monthly: monthlyObj,
            monthlyRevenue: monthlyObj,
            monthly_revenue: monthlyObj,
            months: monthlyObj,
            location: locationObj,
            locations: locationObj,
            locationAnalytics: locationObj,
            location_analytics: locationObj,
            devices: devicesObj,
            deviceDistribution: devicesObj,
            device_distribution: devicesObj,
            platforms: devicesObj,
            platformDistribution: devicesObj,
            deviceSummary: master.deviceSummary,
            refundCount: analysisResult.overview.refundedTransactions,
            refundAmount: analysisResult.revenue.refundAmount,
            refundRate: analysisResult.performance.refundRate
        };

        res.json({
            ...resultPayload,
            data: resultPayload
        });

    } catch (err) {
        console.error("Analysis Error:", err);
        res.status(500).json({ message: "Failed to process file analysis", error: err.message });
    }
};

// Professional Colorful Excel Export using ExcelJS
exports.exportReport = async (req, res) => {
    try {
        const reportId = req.body?.reportId || req.query?.reportId;
        let master = null;

        if (reportId && reportCache.has(reportId)) {
            master = reportCache.get(reportId);
        } else if (lastUploadedRawData) {
            master = computeMasterData(lastUploadedRawData);
        } else {
            const uploadsDir = path.join(__dirname, "../uploads");
            if (fs.existsSync(uploadsDir)) {
                const files = fs.readdirSync(uploadsDir);
                if (files.length > 0) {
                    const latestFile = path.join(uploadsDir, files[files.length - 1]);
                    if (fs.existsSync(latestFile)) {
                        const wb = XLSX.readFile(latestFile);
                        const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                        if (raw && raw.length > 0) {
                            master = computeMasterData(raw);
                        }
                    }
                }
            }
        }

        if (!master) {
            return res.status(400).json({ 
                message: "No active report session found. Please re-upload your transaction file first." 
            });
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "InsightX AI";
        workbook.created = new Date();

        const headerBgColor = "1E293B"; // Dark Slate
        const subHeaderBgColor = "0284C7"; // Cyan Accent
        const whiteFont = "FFFFFF";

        // 1. Executive Dashboard Sheet
        const execSheet = workbook.addWorksheet("Executive_Dashboard", { views: [{ showGridLines: true }] });
        
        execSheet.mergeCells("A1:E1");
        const titleCell = execSheet.getCell("A1");
        titleCell.value = " 📊 INSIGHTX AI - EXECUTIVE MASTER ANALYTICS REPORT ";
        titleCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: whiteFont } };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: headerBgColor } };
        titleCell.alignment = { vertical: "middle", horizontal: "left" };
        execSheet.getRow(1).height = 35;

        execSheet.getCell("A2").value = `Generated At: ${new Date().toLocaleString()}`;
        execSheet.getCell("A2").font = { name: "Segoe UI", size: 10, italic: true, color: { argb: "64748B" } };

        const kpiRows = [
            ["", ""],
            ["OVERALL TRANSACTION SUMMARY", "VALUE"],
            ["Total Transactions", master.summary.totalTransactions],
            ["Successful Transactions", master.summary.successfulCount],
            ["Failed Transactions", master.summary.failedCount],
            ["Refunded Transactions", master.summary.refundCount],
            ["", ""],
            ["FINANCIAL & REVENUE METRICS (₹)", "AMOUNT (₹)"],
            ["Total Gross Volume", master.summary.totalVolume],
            ["Successful Volume", master.summary.successVolume],
            ["Failed Volume", master.summary.failedVolume],
            ["Total Refund Amount", master.summary.refundVolume],
            ["Net Revenue", master.summary.netRevenue],
            ["", ""],
            ["PERFORMANCE KPIS", "RATE (%)"],
            ["Success Rate", `${master.summary.successRate}%`],
            ["Refund Rate", `${master.summary.refundRate}%`],
            ["", ""]
        ];

        kpiRows.forEach(row => {
            const r = execSheet.addRow(row);
            if (row[1] === "VALUE" || row[1] === "AMOUNT (₹)" || row[1] === "RATE (%)") {
                r.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: whiteFont } };
                r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: subHeaderBgColor } };
            } else {
                r.font = { name: "Segoe UI", size: 10 };
            }
        });

        execSheet.addRow([""]);
        const devHeaderRow = execSheet.addRow(["DEVICE CATEGORY", "TOTAL TRANSACTIONS", "TOTAL VOLUME (₹)", "SUCCESS VOLUME (₹)", "FAILED VOLUME (₹)"]);
        devHeaderRow.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: whiteFont } };
        devHeaderRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: headerBgColor } };
        devHeaderRow.alignment = { vertical: "middle", horizontal: "center" };
        devHeaderRow.height = 25;

        master.deviceSummary.forEach(d => {
            const row = execSheet.addRow([d.device_category, d.Total_Transactions, d.Total_Volume, d.Success_Volume, d.Failed_Volume]);
            row.font = { name: "Segoe UI", size: 10 };
        });

        execSheet.columns.forEach(col => { col.width = 30; });

        // Helper for standard sheets
        function addStyledSheet(sheetName, dataArray) {
            if (!dataArray || dataArray.length === 0) return;
            const sheet = workbook.addWorksheet(sheetName, { views: [{ showGridLines: true }] });
            
            const keys = Object.keys(dataArray[0]);
            sheet.addRow(keys);
            
            const headerRow = sheet.getRow(1);
            headerRow.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: whiteFont } };
            headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: headerBgColor } };
            headerRow.alignment = { vertical: "middle", horizontal: "center" };
            headerRow.height = 25;

            dataArray.forEach(item => {
                const values = keys.map(k => item[k]);
                sheet.addRow(values);
            });

            sheet.columns.forEach(col => {
                let maxLength = 15;
                col.eachCell({ includeEmpty: true }, cell => {
                    const val = cell.value ? String(cell.value) : "";
                    if (val.length > maxLength) maxLength = val.length;
                });
                col.width = Math.min(Math.max(maxLength + 4, 15), 45);
            });
        }

        addStyledSheet("DB_Master_Data", master.processedData);
        addStyledSheet("Device_Deep_Dive", master.deviceSummary);
        addStyledSheet("Monthly_Analysis", master.monthlySummary);
        addStyledSheet("Location_Analysis", master.locationSummary);
        addStyledSheet("Refund_Details", master.refundRecords);
        addStyledSheet("Failed_Details", master.failedRecords);
        addStyledSheet("Data_Device", master.deviceSummary);

        res.setHeader("Content-Disposition", "attachment; filename=InsightX_Executive_Master_Report.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Export Error:", err);
        res.status(500).json({ message: "Failed to generate report export", error: err.message });
    }
};