const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const {
    generateReport,
    downloadReportByName,
    exportDynamicReport
} = require("../controllers/report.controller");

router.post(
    "/",
    upload.single("file"),
    generateReport
);

router.get(
    "/download/:filename",
    downloadReportByName
);

router.post(
    "/export",
    exportDynamicReport
);

module.exports = router;