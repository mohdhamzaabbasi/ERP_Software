const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  getTodaySales,
  getSalesByDate,
  getSalesByMonth,
  getTodayPurchases,
  getPurchasesByDate,
  getPurchasesByMonth,
  getProductRegister,
  getLowStockReport
} = require("../controllers/report.controller");

router.use(authMiddleware);
router.get("/sales/today", getTodaySales);
router.get("/sales/by-date", getSalesByDate);
router.get("/sales/by-month", getSalesByMonth);
router.get("/purchases/today", getTodayPurchases);
router.get("/purchases/by-date", getPurchasesByDate);
router.get("/purchases/by-month", getPurchasesByMonth);
router.get("/products", getProductRegister);
router.get("/low-stock", getLowStockReport);

module.exports = router;
