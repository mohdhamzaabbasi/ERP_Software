const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phoneNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    emailId: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
