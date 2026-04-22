const mongoose = require("mongoose");

const purchaseBillSchema = new mongoose.Schema(
  {
    billNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    stockistCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    date: {
      type: Date,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseBill", purchaseBillSchema);
