const PurchaseBill = require("../models/PurchaseBill.model");
const PurchaseItem = require("../models/PurchaseItem.model");
const Product = require("../models/Product.model");
const ProductBatch = require("../models/ProductBatch.model");
const Stockist = require("../models/Stockist.model");
const asyncHandler = require("../utils/asyncHandler");
const generateBillNumber = require("../utils/billNumber");
const runWithOptionalTransaction = require("../utils/transaction");

const normalizeCode = (value) => value.trim().toUpperCase();

const createPurchase = asyncHandler(async (req, res) => {
  const { stockistCode, date = new Date(), items } = req.body;

  if (!stockistCode || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Stockist, date, and purchase items are required" });
  }

  const purchaseDate = new Date(date);
  const normalizedStockist = normalizeCode(stockistCode);
  const stockist = await Stockist.exists({
    stockistCode: normalizedStockist,
    isActive: { $ne: false }
  });

  if (!stockist) {
    return res.status(400).json({ message: "Stockist does not exist" });
  }

  const result = await runWithOptionalTransaction(async (session) => {
    let totalAmount = 0;
    const normalizedItems = [];

    for (const item of items) {
      const productCode = normalizeCode(item.productCode || "");
      const purchaseRate = Number(item.purchaseRate);
      const saleRate = Number(item.saleRate);
      const quantity = Number(item.quantity);

      if (!productCode || purchaseRate < 0 || saleRate < 0 || quantity < 1) {
        const error = new Error("Each purchase item needs product, purchase rate, sale rate, and quantity");
        error.statusCode = 400;
        throw error;
      }

      const product = await Product.findOne({
        productCode,
        isActive: { $ne: false }
      }).session(session);

      if (!product) {
        const error = new Error(`Product not found: ${productCode}`);
        error.statusCode = 404;
        throw error;
      }

      if (product.stockistCode !== normalizedStockist) {
        const error = new Error(`${productCode} does not belong to selected stockist`);
        error.statusCode = 400;
        throw error;
      }

      const netAmount = purchaseRate * quantity;
      totalAmount += netAmount;
      const currentBatch = Number(product.batch || 0);
      const lastPurchaseRate = Number(product.latestPurchaseRate || 0);
      const batch =
        currentBatch === 0 || lastPurchaseRate === purchaseRate
          ? Math.max(currentBatch, 1)
          : currentBatch + 1;

      normalizedItems.push({ product, productCode, purchaseRate, saleRate, quantity, netAmount, batch });
    }

    const billNo = await generateBillNumber(PurchaseBill, "P", purchaseDate, session);

    const [bill] = await PurchaseBill.create(
      [{ billNo, stockistCode: normalizedStockist, date: purchaseDate, totalAmount }],
      { session }
    );

    await PurchaseItem.create(
      normalizedItems.map((item) => ({
        billNo,
        productCode: item.productCode,
        purchaseRate: item.purchaseRate,
        saleRate: item.saleRate,
        batch: item.batch,
        quantity: item.quantity,
        netAmount: item.netAmount
      })),
      { session }
    );

    for (const item of normalizedItems) {
      const existingBatch = await ProductBatch.findOne({
        productCode: item.productCode,
        batch: item.batch
      }).session(session);

      if (existingBatch) {
        existingBatch.quantity += item.quantity;
        existingBatch.purchaseRate = item.purchaseRate;
        existingBatch.saleRate = item.saleRate;
        await existingBatch.save({ session });
      } else {
        await ProductBatch.create(
          [
            {
              productCode: item.productCode,
              batch: item.batch,
              purchaseRate: item.purchaseRate,
              saleRate: item.saleRate,
              quantity: item.quantity
            }
          ],
          { session }
        );
      }

      item.product.quantity += item.quantity;
      item.product.latestPurchaseRate = item.purchaseRate;
      item.product.saleRate = item.saleRate;
      item.product.batch = item.batch;
      await item.product.save({ session });
    }

    return bill;
  });

  return res.status(201).json(result);
});

const getPurchases = asyncHandler(async (req, res) => {
  const bills = await PurchaseBill.find().sort({ date: -1, createdAt: -1 }).limit(100);
  res.json(bills);
});

module.exports = { createPurchase, getPurchases };
