const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    billNo: {
      type: String,
      required: true,
      trim: true
    },
    productCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    purchaseRate: {
      type: Number,
      required: true,
      min: 0
    },
    saleRate: {
      type: Number,
      required: true,
      min: 0
    },
    batch: {
      type: Number,
      required: true,
      min: 1
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseItem", purchaseItemSchema);
