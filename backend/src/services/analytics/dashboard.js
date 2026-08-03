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