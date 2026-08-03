const express = require("express");
const cors = require("cors");
const path = require("path");

const uploadRoutes = require("./routes/upload.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Reports Download
app.use(
    "/reports",
    express.static(path.join(__dirname, "reports"))
);

// Uploaded Files
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

app.get("/", (req, res) => {

    res.json({
        success: true,
        project: "InsightX AI",
        message: "Backend Running 🚀"
    });

});

app.use("/api/upload", uploadRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/report", reportRoutes);

module.exports = app;