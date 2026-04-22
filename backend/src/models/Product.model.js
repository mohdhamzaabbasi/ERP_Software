const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    stockistCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    latestPurchaseRate: {
      type: Number,
      min: 0,
      default: 0
    },
    saleRate: {
      type: Number,
      min: 0,
      default: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    minimumQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    batch: {
      type: Number,
      min: 0,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
