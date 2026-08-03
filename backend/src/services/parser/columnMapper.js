const normalize = (value) => {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
};

const aliases = {
    transactionid: "transaction_id",
    transaction_id: "transaction_id",

    customerid: "customer_id",
    customer_id: "customer_id",

    customername: "customer_name",
    customer_name: "customer_name",

    paymentmode: "payment_mode",
    paymode: "payment_mode",
    pay_mode: "payment_mode",

    paymentstatus: "payment_status",
    payment_status: "payment_status",

    paymentsource: "payment_source",
    payment_source: "payment_source",

    amount: "amount",
    total: "amount",
    price: "amount",
    value: "amount",

    createdat: "created_at",
    created_at: "created_at",

    updatedat: "updated_at",
    updated_at: "updated_at",

    entrytime: "entry_time",
    entry_time: "entry_time",

    status: "status",

    refund: "is_refund",
    isrefund: "is_refund",
    is_refund: "is_refund",

    device: "device_name",
    devicename: "device_name",
    device_name: "device_name",

    platform: "platform",

    orgid: "org_id",
    org_id: "org_id",

    locationid: "location_id",
    location_id: "location_id"
};

exports.mapColumns = (headers = []) => {
    const mapping = {};

    headers.forEach((header) => {
        const key = normalize(header);

        mapping[header] = aliases[key] || key;
    });

    return mapping;
};