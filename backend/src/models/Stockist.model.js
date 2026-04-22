const mongoose = require("mongoose");

const stockistSchema = new mongoose.Schema(
  {
    stockistCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    stockistName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    address: {
      type: String,
      trim: true,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stockist", stockistSchema);
