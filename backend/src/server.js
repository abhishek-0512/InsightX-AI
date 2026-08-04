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

// Serve generated reports
app.use("/reports", express.static(path.join(__dirname, "reports")));

// API Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/report", reportRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("🚀 InsightX AI Backend is Live!");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`✅ Server is running successfully on port ${PORT}`);
});