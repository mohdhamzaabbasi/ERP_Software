const mongoose = require("mongoose");

const saleBillSchema = new mongoose.Schema(
  {
    billNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customerId: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SaleBill", saleBillSchema);
