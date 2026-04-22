const Admin = require("../models/Admin.model");
const asyncHandler = require("../utils/asyncHandler");
const { comparePassword, generateToken } = require("../utils/auth.utils");

const getBranding = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ isActive: { $ne: false } }).select(
    "businessName businessDescription"
  );

  res.json({
    businessName: admin?.businessName || "Power Spares",
    businessDescription:
      admin?.businessDescription ||
      "Inventory, billing, purchases, sales, customers, and reports for your spare parts shop."
  });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const admin = await Admin.findOne({ username: username.toLowerCase().trim() });

  if (!admin || !admin.isActive) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await comparePassword(password, admin.passwordHash);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({
    message: "Login successful",
    token: generateToken(admin),
    admin: {
      username: admin.username,
      businessName: admin.businessName,
      businessDescription: admin.businessDescription
    }
  });
});

const me = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id).select(
    "username businessName businessDescription isActive"
  );

  if (!admin || !admin.isActive) {
    return res.status(401).json({ message: "Admin not found" });
  }

  return res.json({
    username: admin.username,
    businessName: admin.businessName,
    businessDescription: admin.businessDescription
  });
});

module.exports = { getBranding, login, me };
