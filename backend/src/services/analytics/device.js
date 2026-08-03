const detector = require("./detector");

exports.analyze = (rows) => {

    const devices = {};

    rows.forEach((row) => {

        const device =
            detector.getValue(
                row,
                [
                    "device",
                    "device_type",
                    "platform",
                    "os",
                    "operating_system",
                    "user_device"
                ]
            ) || "Unknown";

        devices[device] =
            (devices[device] || 0) + 1;

    });

    const topDevice =
        Object.entries(devices)
            .sort((a, b) => b[1] - a[1])[0] || null;

    return {

        available: Object.keys(devices).length > 0,

        devices,

        topDevice

    };

};