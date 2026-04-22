const Stockist = require("../models/Stockist.model");
const Product = require("../models/Product.model");
const asyncHandler = require("../utils/asyncHandler");

const normalizeCode = (value) => value.trim().toUpperCase();

const createStockist = asyncHandler(async (req, res) => {
  const { stockistCode, stockistName, phone = "", address = "" } = req.body;

  if (!stockistCode || !stockistName) {
    return res.status(400).json({ message: "Stockist code and name are required" });
  }

  const stockist = await Stockist.create({
    stockistCode: normalizeCode(stockistCode),
    stockistName,
    phone,
    address,
    isActive: true
  });

  return res.status(201).json(stockist);
});

const getStockists = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === "true";
  const filter = includeInactive ? {} : { isActive: { $ne: false } };
  const stockists = await Stockist.find(filter).sort({ stockistName: 1 });
  res.json(stockists);
});

const updateStockist = asyncHandler(async (req, res) => {
  const { stockistName, phone = "", address = "" } = req.body;

  const stockist = await Stockist.findOneAndUpdate(
    { stockistCode: normalizeCode(req.params.code), isActive: { $ne: false } },
    { stockistName, phone, address },
    { new: true, runValidators: true }
  );

  if (!stockist) {
    return res.status(404).json({ message: "Stockist not found" });
  }

  return res.json(stockist);
});

const deleteStockist = asyncHandler(async (req, res) => {
  const stockistCode = normalizeCode(req.params.code);

  const stockist = await Stockist.findOneAndUpdate(
    { stockistCode, isActive: { $ne: false } },
    { isActive: false },
    { new: true }
  );

  if (!stockist) {
    return res.status(404).json({ message: "Stockist not found" });
  }

  const productUpdate = await Product.updateMany(
    { stockistCode, isActive: { $ne: false } },
    { isActive: false }
  );

  return res.json({
    message: "Stockist and related products marked inactive successfully",
    inactiveProducts: productUpdate.modifiedCount || 0
  });
});

module.exports = { createStockist, getStockists, updateStockist, deleteStockist };
