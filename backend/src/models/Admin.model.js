const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      default: "Power Spares"
    },
    businessDescription: {
      type: String,
      required: true,
      trim: true,
      default: "Inventory, billing, purchases, sales, customers, and reports for your spare parts shop."
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
