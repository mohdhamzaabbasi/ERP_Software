const SaleBill = require("../models/SaleBill.model");
const PurchaseBill = require("../models/PurchaseBill.model");
const Product = require("../models/Product.model");
const asyncHandler = require("../utils/asyncHandler");
const { getDayRange } = require("../utils/dateRange");

const getDashboardSummary = asyncHandler(async (req, res) => {
  const { start, end } = getDayRange();

  const [todaySales, todayPurchases, totalProducts, lowStockProductCount, recentSales, recentPurchases] =
    await Promise.all([
      SaleBill.aggregate([
        { $match: { date: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: "$netAmount" } } }
      ]),
      PurchaseBill.aggregate([
        { $match: { date: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Product.countDocuments({ isActive: { $ne: false } }),
      Product.countDocuments({
        isActive: { $ne: false },
        $expr: { $lte: ["$quantity", "$minimumQuantity"] }
      }),
      SaleBill.find().sort({ date: -1, createdAt: -1 }).limit(5),
      PurchaseBill.find().sort({ date: -1, createdAt: -1 }).limit(5)
    ]);

  res.json({
    todaySales: todaySales[0]?.total || 0,
    todayPurchases: todayPurchases[0]?.total || 0,
    totalProducts,
    lowStockProductCount,
    recentSales,
    recentPurchases
  });
});

module.exports = { getDashboardSummary };
