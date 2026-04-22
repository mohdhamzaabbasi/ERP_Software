const SaleBill = require("../models/SaleBill.model");
const SaleItem = require("../models/SaleItem.model");
const PurchaseBill = require("../models/PurchaseBill.model");
const PurchaseItem = require("../models/PurchaseItem.model");
const Product = require("../models/Product.model");
const Customer = require("../models/Customer.model");
const asyncHandler = require("../utils/asyncHandler");
const { getDayRange, getMonthRange } = require("../utils/dateRange");

const normalizeCode = (value) => value.trim().toUpperCase();

const buildSaleBills = async (filter) => {
  const bills = await SaleBill.find(filter).sort({ date: 1, createdAt: 1 });

  return Promise.all(
    bills.map(async (bill) => {
      const [items, customer] = await Promise.all([
        SaleItem.find({ billNo: bill.billNo }).sort({ createdAt: 1 }),
        Customer.findOne({ customerId: bill.customerId })
      ]);

      return {
        billNo: bill.billNo,
        date: bill.date,
        customer,
        items,
        totalAmount: bill.totalAmount,
        discount: bill.discount,
        netAmount: bill.netAmount
      };
    })
  );
};

const buildPurchaseBills = async (filter) => {
  const bills = await PurchaseBill.find(filter).sort({ date: 1, createdAt: 1 });

  return Promise.all(
    bills.map(async (bill) => {
      const items = await PurchaseItem.find({ billNo: bill.billNo }).sort({ createdAt: 1 });

      return {
        billNo: bill.billNo,
        date: bill.date,
        stockistCode: bill.stockistCode,
        items,
        totalAmount: bill.totalAmount
      };
    })
  );
};

const getTodaySales = asyncHandler(async (req, res) => {
  const { start, end } = getDayRange();
  res.json(await buildSaleBills({ date: { $gte: start, $lt: end } }));
});

const getSalesByDate = asyncHandler(async (req, res) => {
  if (!req.query.date) {
    return res.status(400).json({ message: "Date is required" });
  }
  const { start, end } = getDayRange(req.query.date);
  res.json(await buildSaleBills({ date: { $gte: start, $lt: end } }));
});

const getSalesByMonth = asyncHandler(async (req, res) => {
  const { start, end } = getMonthRange(req.query.month, req.query.year);
  res.json(await buildSaleBills({ date: { $gte: start, $lt: end } }));
});

const getTodayPurchases = asyncHandler(async (req, res) => {
  const { start, end } = getDayRange();
  res.json(await buildPurchaseBills({ date: { $gte: start, $lt: end } }));
});

const getPurchasesByDate = asyncHandler(async (req, res) => {
  if (!req.query.date) {
    return res.status(400).json({ message: "Date is required" });
  }
  const { start, end } = getDayRange(req.query.date);
  res.json(await buildPurchaseBills({ date: { $gte: start, $lt: end } }));
});

const getPurchasesByMonth = asyncHandler(async (req, res) => {
  const { start, end } = getMonthRange(req.query.month, req.query.year);
  res.json(await buildPurchaseBills({ date: { $gte: start, $lt: end } }));
});

const getProductRegister = asyncHandler(async (req, res) => {
  if (!req.query.stockistCode) {
    return res.status(400).json({ message: "Stockist code is required" });
  }

  const products = await Product.find({
    stockistCode: normalizeCode(req.query.stockistCode),
    isActive: { $ne: false }
  }).sort({ productName: 1 });

  res.json(products);
});

const getLowStockReport = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: { $ne: false },
    $expr: { $lte: ["$quantity", "$minimumQuantity"] }
  }).sort({ stockistCode: 1, productName: 1 });

  res.json(products);
});

module.exports = {
  getTodaySales,
  getSalesByDate,
  getSalesByMonth,
  getTodayPurchases,
  getPurchasesByDate,
  getPurchasesByMonth,
  getProductRegister,
  getLowStockReport
};
