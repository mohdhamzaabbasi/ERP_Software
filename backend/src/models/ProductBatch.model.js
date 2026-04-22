const mongoose = require("mongoose");

const productBatchSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    batch: {
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
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  },
  { timestamps: true }
);

productBatchSchema.index({ productCode: 1, batch: 1 }, { unique: true });

module.exports = mongoose.model("ProductBatch", productBatchSchema);
