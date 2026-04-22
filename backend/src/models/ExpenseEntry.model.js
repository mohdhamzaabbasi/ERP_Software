const mongoose = require("mongoose");

const expenseEntrySchema = new mongoose.Schema(
  {
    expenseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    note: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExpenseEntry", expenseEntrySchema);
