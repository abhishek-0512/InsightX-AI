const payment = require("./payment");
const refund = require("./refund");
const failure = require("./failure");
const device = require("./device");
const monthly = require("./monthly");
const location = require("./location");
const dashboard = require("./dashboard");

exports.analyze = (rows) => {

    const paymentAnalysis = payment.analyze(rows);

    const refundAnalysis = refund.analyze(rows);

    const failureAnalysis = failure.analyze(rows);

    const deviceAnalysis = device.analyze(rows);

    const monthlyAnalysis = monthly.analyze(rows);

    const locationAnalysis = location.analyze(rows);

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
        dashboard: dashboardAnalysis
    };

};