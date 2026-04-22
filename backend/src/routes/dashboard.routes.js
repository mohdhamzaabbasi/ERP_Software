const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const { getDashboardSummary } = require("../controllers/dashboard.controller");

router.get("/summary", authMiddleware, getDashboardSummary);

module.exports = router;
