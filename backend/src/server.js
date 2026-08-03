const express = require("express");
const cors = require("cors");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
    res.send("InsightX AI Analytics Engine is running live!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});