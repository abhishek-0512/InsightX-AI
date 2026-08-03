const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const {
    generateReport
} = require("../controllers/report.controller");

router.post(
    "/",
    upload.single("file"),
    generateReport
);

module.exports = router;