const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const {
    analyzeFile
} = require("../controllers/analytics.controller");

router.post(
    "/",
    upload.single("file"),
    analyzeFile
);

module.exports = router;