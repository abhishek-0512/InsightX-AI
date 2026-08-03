const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const analyticsController = require("../controllers/analytics.controller");

router.post("/", upload.single("file"), analyticsController.analyzeFile);
router.post("/export", analyticsController.exportReport);
router.get("/export", analyticsController.exportReport);

module.exports = router;