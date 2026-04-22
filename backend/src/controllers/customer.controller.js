const Customer = require("../models/Customer.model");
const SaleBill = require("../models/SaleBill.model");
const asyncHandler = require("../utils/asyncHandler");

const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find().sort({ name: 1 });
  res.json(customers);
});

const lookupCustomer = asyncHandler(async (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const customer = await Customer.findOne({ phoneNo: phone });

  if (!customer) {
    return res.json({ exists: false });
  }

  return res.json({ exists: true, customer });
});

const getCustomerHistory = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ customerId: req.params.customerId });

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const sales = await SaleBill.find({ customerId: customer.customerId }).sort({ date: -1 });
  res.json({ customer, sales });
});

module.exports = { getCustomers, lookupCustomer, getCustomerHistory };
