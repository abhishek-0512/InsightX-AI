const payment = require("./payment");
const refund = require("./refund");
const failure = require("./failure");
const device = require("./device");
const monthly = require("./monthly");
const location = require("./location");
const dashboard = require("./dashboard");
const summary = require("./summary");
const quality = require("./quality");
const numeric = require("./numeric");
const categorical = require("./categorical");
const datetime = require("./datetime");
const detector = require("./detector");
const { parseDate, formatMonthYear, sortMonthsChronologically } = require("../../utils/dateParser");

function getDateMetadata(rows = []) {
    const dates = [];
    const monthsSet = new Set();

    rows.forEach((row) => {
        const val = detector.getValue(row, [
            "created_at",
            "entry_time",
            "date",
            "transaction_date",
            "createdat",
            "payment_date",
            "timestamp"
        ]);

        if (!val) return;

        const d = parseDate(val);
        if (d) {
            dates.push(d);
            const m = formatMonthYear(d);
            if (m) monthsSet.add(m);
        }
    });

    if (!dates.length) {
        return {
            earliestDate: null,
            latestDate: null,
            availableMonths: []
        };
    }

    dates.sort((a, b) => a - b);

    return {
        earliestDate: dates[0].toISOString(),
        latestDate: dates[dates.length - 1].toISOString(),
        availableMonths: sortMonthsChronologically(Array.from(monthsSet))
    };
}

exports.analyze = (rows = []) => {
    const paymentAnalysis = payment.analyze(rows);
    const refundAnalysis = refund.analyze(rows);
    const failureAnalysis = failure.analyze(rows);
    const deviceAnalysis = device.analyze(rows);
    const monthlyAnalysis = monthly.analyze(rows);
    const locationAnalysis = location.analyze(rows);
    const summaryAnalysis = summary.generateSummary(rows);
    const qualityAnalysis = quality.analyze(rows);
    const numericAnalysis = numeric.analyze(rows);
    const categoricalAnalysis = categorical.analyze(rows);
    const datetimeAnalysis = datetime.analyze(rows);
    const dateMeta = getDateMetadata(rows);

    const dashboardAnalysis = dashboard.analyze({
        payment: paymentAnalysis,
        refund: refundAnalysis,
        failure: failureAnalysis,
        device: deviceAnalysis,
        monthly: monthlyAnalysis,
        location: locationAnalysis
    });

    return {
        payment: paymentAnalysis,
        refund: refundAnalysis,
        failure: failureAnalysis,
        device: deviceAnalysis,
        monthly: monthlyAnalysis,
        location: locationAnalysis,
        dashboard: dashboardAnalysis,
        summary: summaryAnalysis,
        quality: qualityAnalysis,
        numeric: numericAnalysis,
        categorical: categoricalAnalysis,
        datetime: datetimeAnalysis,
        dateMeta
    };
};