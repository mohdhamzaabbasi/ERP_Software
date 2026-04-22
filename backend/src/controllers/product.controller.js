const Product = require("../models/Product.model");
const ProductBatch = require("../models/ProductBatch.model");
const Stockist = require("../models/Stockist.model");
const asyncHandler = require("../utils/asyncHandler");

const normalizeCode = (value) => value.trim().toUpperCase();

const allowedFields = [
  "stockistCode",
  "productName",
  "minimumQuantity"
];

const createProduct = asyncHandler(async (req, res) => {
  const {
    productCode,
    stockistCode,
    productName,
    minimumQuantity = 0
  } = req.body;

  if (!productCode || !stockistCode || !productName) {
    return res.status(400).json({ message: "Product code, stockist, and name are required" });
  }

  const normalizedStockist = normalizeCode(stockistCode);
  const stockist = await Stockist.exists({
    stockistCode: normalizedStockist,
    isActive: { $ne: false }
  });

  if (!stockist) {
    return res.status(400).json({ message: "Stockist does not exist" });
  }

  const product = await Product.create({
    productCode: normalizeCode(productCode),
    stockistCode: normalizedStockist,
    productName,
    latestPurchaseRate: 0,
    saleRate: 0,
    quantity: 0,
    minimumQuantity,
    batch: 0,
    isActive: true
  });

  return res.status(201).json(product);
});

const getProducts = asyncHandler(async (req, res) => {
  const { q, stockistCode, lowStock } = req.query;
  const includeInactive = req.query.includeInactive === "true";
  const filter = includeInactive ? {} : { isActive: { $ne: false } };

  if (stockistCode) {
    filter.stockistCode = normalizeCode(stockistCode);
  }

  if (q) {
    filter.$or = [
      { productCode: { $regex: q, $options: "i" } },
      { productName: { $regex: q, $options: "i" } }
    ];
  }

  if (lowStock === "true") {
    filter.$expr = { $lte: ["$quantity", "$minimumQuantity"] };
  }

  const products = await Product.find(filter).sort({ productName: 1 }).lean();
  const productCodes = products.map((product) => product.productCode);
  const batches = await ProductBatch.find({
    productCode: { $in: productCodes },
    quantity: { $gt: 0 }
  })
    .sort({ productCode: 1, batch: 1, createdAt: 1 })
    .lean();

  const batchesByProduct = batches.reduce((map, batch) => {
    map[batch.productCode] = map[batch.productCode] || [];
    map[batch.productCode].push(batch);
    return map;
  }, {});

  res.json(
    products.map((product) => ({
      ...product,
      batches: batchesByProduct[product.productCode] || []
    }))
  );
});

const updateProduct = asyncHandler(async (req, res) => {
  const updates = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = field === "stockistCode" ? normalizeCode(req.body[field]) : req.body[field];
    }
  }

  if (updates.stockistCode) {
    const stockist = await Stockist.exists({
      stockistCode: updates.stockistCode,
      isActive: { $ne: false }
    });
    if (!stockist) {
      return res.status(400).json({ message: "Stockist does not exist" });
    }
  }

  const product = await Product.findOneAndUpdate(
    { productCode: normalizeCode(req.params.code), isActive: { $ne: false } },
    updates,
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const productCode = normalizeCode(req.params.code);

  const product = await Product.findOneAndUpdate(
    { productCode, isActive: { $ne: false } },
    { isActive: false },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ message: "Product marked inactive successfully" });
});

module.exports = { createProduct, getProducts, updateProduct, deleteProduct };
