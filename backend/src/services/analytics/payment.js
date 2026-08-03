const detector = require("../parser/detector");

exports.analyze = (rows) => {
    const totalTransactions = rows.length;
    let successfulTransactions = 0;
    let failedTransactions = 0;
    let refundedTransactions = 0;
    let totalAmount = 0;
    let refundAmount = 0;
    const paymentModes = {};

    rows.forEach((row) => {
        // ---------------- Amount ----------------
        const amount = Number(
            row.amount || row.Amount ||
            detector.getValue(row, ["amount", "transaction_amount", "payment_amount", "value"])
        ) || 0;
        
        totalAmount += amount;

        // ---------------- Status ----------------
        // Checking payment_status first because 'status' is often a generic 0/1 integer in databases
        const rawStatus = row.payment_status || row.Payment_Status || 
            detector.getValue(row, ["payment_status", "status", "transaction_status"]) || 
            row.status || "";
            
        const status = String(rawStatus).trim().toLowerCase();

        if (status.includes("success") || status.includes("completed") || status === "paid" || status === "1") {
            successfulTransactions++;
        } else if (status.includes("fail") || status.includes("failure") || status.includes("declined") || status.includes("cancel") || status === "0") {
            failedTransactions++;
        } else if (status.includes("refund")) {
            refundedTransactions++;
            refundAmount += amount;
        }

        // ---------------- Refund Flag ----------------
        const refundFlag = String(
            row.is_refund || row.Is_Refund || 
            detector.getValue(row, ["is_refund", "refund", "refunded"]) || ""
        ).toLowerCase();

        // Prevent double counting if status was already marked as refund
        if ((refundFlag === "true" || refundFlag === "yes" || refundFlag === "1") && !status.includes("refund")) {
            refundedTransactions++;
            refundAmount += amount;
        }

        // ---------------- Payment Mode ----------------
        let mode = row.pay_mode || row.Pay_Mode || row.payment_mode || 
            detector.getValue(row, ["pay_mode", "payment_mode", "paymentmode", "payment_method", "paymentmethod", "mode"]);
            
        if (!mode || String(mode).trim() === "") {
            mode = "Unknown";
        }

        paymentModes[mode] = (paymentModes[mode] || 0) + 1;
    });

    const successRate = totalTransactions ? Number(((successfulTransactions / totalTransactions) * 100).toFixed(2)) : 0;
    const refundRate = totalTransactions ? Number(((refundedTransactions / totalTransactions) * 100).toFixed(2)) : 0;

    return {
        overview: {
            totalTransactions,
            successfulTransactions,
            failedTransactions,
            refundedTransactions
        },
        paymentModes,
        revenue: {
            totalAmount,
            refundAmount,
            netAmount: totalAmount - refundAmount
        },
        successRate,
        refundRate
    };
};