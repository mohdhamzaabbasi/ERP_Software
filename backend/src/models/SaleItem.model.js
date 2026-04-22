const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema(
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
    productNameSnapshot: {
      type: String,
      required: true,
      trim: true
    },
    saleRateSnapshot: {
      type: Number,
      required: true,
      min: 0
    },
    batchAllocations: [
      {
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
        amount: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SaleItem", saleItemSchema);
