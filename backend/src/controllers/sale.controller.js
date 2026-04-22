const SaleBill = require("../models/SaleBill.model");
const SaleItem = require("../models/SaleItem.model");
const Product = require("../models/Product.model");
const ProductBatch = require("../models/ProductBatch.model");
const Customer = require("../models/Customer.model");
const asyncHandler = require("../utils/asyncHandler");
const generateBillNumber = require("../utils/billNumber");
const runWithOptionalTransaction = require("../utils/transaction");

const normalizeCode = (value) => value.trim().toUpperCase();
const phonePattern = /^\d{10}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getCustomerId = () => `CUST-${Date.now()}`;

const mergeSaleItems = (items) => {
  const merged = new Map();

  for (const item of items) {
    const productCode = normalizeCode(item.productCode || "");
    const quantity = Number(item.quantity);

    if (!productCode || quantity < 1) {
      const error = new Error("Each sale item needs product and quantity");
      error.statusCode = 400;
      throw error;
    }

    merged.set(productCode, (merged.get(productCode) || 0) + quantity);
  }

  return [...merged.entries()].map(([productCode, quantity]) => ({ productCode, quantity }));
};

const getSellableBatches = async (product, session) => {
  let batches = await ProductBatch.find({
    productCode: product.productCode,
    quantity: { $gt: 0 }
  })
    .sort({ batch: 1, createdAt: 1 })
    .session(session);

  if (batches.length === 0 && product.quantity > 0) {
    const [fallbackBatch] = await ProductBatch.create(
      [
        {
          productCode: product.productCode,
          batch: Math.max(Number(product.batch || 1), 1),
          purchaseRate: Number(product.latestPurchaseRate || 0),
          saleRate: Number(product.saleRate || 0),
          quantity: product.quantity
        }
      ],
      { session }
    );
    batches = [fallbackBatch];
  }

  return batches;
};

const createSale = asyncHandler(async (req, res) => {
  const {
    customerName,
    phoneNo,
    emailId = "",
    date = new Date(),
    items,
    discount = 0
  } = req.body;

  if (!customerName || !phoneNo || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Customer, phone, and sale items are required" });
  }

  if (!phonePattern.test(phoneNo)) {
    return res.status(400).json({ message: "Customer phone number must be exactly 10 digits" });
  }

  if (emailId && !emailPattern.test(emailId)) {
    return res.status(400).json({ message: "Customer email address is invalid" });
  }

  const saleDate = new Date(date);
  const discountValue = Number(discount) || 0;

  if (discountValue < 0) {
    return res.status(400).json({ message: "Discount cannot be negative" });
  }

  const result = await runWithOptionalTransaction(async (session) => {
    let customer = await Customer.findOne({ phoneNo }).session(session);

    if (!customer) {
      [customer] = await Customer.create(
        [{ customerId: getCustomerId(), name: customerName, phoneNo, emailId }],
        { session }
      );
    } else {
      customer.name = customerName || customer.name;
      customer.emailId = emailId || customer.emailId;
      await customer.save({ session });
    }

    let totalAmount = 0;
    const normalizedItems = [];
    const mergedItems = mergeSaleItems(items);

    for (const item of mergedItems) {
      const product = await Product.findOne({
        productCode: item.productCode,
        isActive: { $ne: false }
      }).session(session);

      if (!product) {
        const error = new Error(`Product not found: ${item.productCode}`);
        error.statusCode = 404;
        throw error;
      }

      if (product.quantity < item.quantity) {
        const error = new Error(`Insufficient stock for ${product.productName}`);
        error.statusCode = 400;
        throw error;
      }

      let remainingQuantity = item.quantity;
      let amount = 0;
      const batchAllocations = [];
      const batches = await getSellableBatches(product, session);

      for (const batch of batches) {
        if (remainingQuantity === 0) break;

        const allocatedQuantity = Math.min(batch.quantity, remainingQuantity);
        const allocationAmount = batch.saleRate * allocatedQuantity;

        batchAllocations.push({
          batch: batch.batch,
          quantity: allocatedQuantity,
          purchaseRate: batch.purchaseRate,
          saleRate: batch.saleRate,
          amount: allocationAmount
        });

        amount += allocationAmount;
        remainingQuantity -= allocatedQuantity;
      }

      if (remainingQuantity > 0) {
        const error = new Error(`Insufficient batch stock for ${product.productName}`);
        error.statusCode = 400;
        throw error;
      }

      totalAmount += amount;
      normalizedItems.push({
        product,
        productCode: item.productCode,
        quantity: item.quantity,
        amount,
        batchAllocations
      });
    }

    if (discountValue > totalAmount) {
      const error = new Error("Discount cannot exceed total amount");
      error.statusCode = 400;
      throw error;
    }

    const billNo = await generateBillNumber(SaleBill, "S", saleDate, session);
    const netAmount = totalAmount - discountValue;

    const [bill] = await SaleBill.create(
      [{ billNo, customerId: customer.customerId, date: saleDate, totalAmount, discount: discountValue, netAmount }],
      { session }
    );

    await SaleItem.create(
      normalizedItems.map((item) => ({
        billNo,
        productCode: item.productCode,
        productNameSnapshot: item.product.productName,
        saleRateSnapshot: item.amount / item.quantity,
        batchAllocations: item.batchAllocations,
        quantity: item.quantity,
        amount: item.amount
      })),
      { session }
    );

    for (const item of normalizedItems) {
      for (const allocation of item.batchAllocations) {
        await ProductBatch.updateOne(
          { productCode: item.productCode, batch: allocation.batch },
          { $inc: { quantity: -allocation.quantity } },
          { session }
        );
      }

      item.product.quantity -= item.quantity;
      await item.product.save({ session });
    }

    return bill;
  });

  return res.status(201).json(result);
});

const getSales = asyncHandler(async (req, res) => {
  const bills = await SaleBill.find().sort({ date: -1, createdAt: -1 }).limit(100);
  res.json(bills);
});

module.exports = { createSale, getSales };
