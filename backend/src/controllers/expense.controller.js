const ExpenseCategory = require("../models/ExpenseCategory.model");
const ExpenseEntry = require("../models/ExpenseEntry.model");
const asyncHandler = require("../utils/asyncHandler");

const normalizeCode = (value) => value.trim().toUpperCase();

const createCategory = asyncHandler(async (req, res) => {
  const { expenseCode, expenseCategory } = req.body;

  if (!expenseCode || !expenseCategory) {
    return res.status(400).json({ message: "Expense code and category are required" });
  }

  const category = await ExpenseCategory.create({
    expenseCode: normalizeCode(expenseCode),
    expenseCategory
  });

  res.status(201).json(category);
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await ExpenseCategory.find().sort({ expenseCategory: 1 });
  res.json(categories);
});

const addExpense = asyncHandler(async (req, res) => {
  const { expenseCode, date, amount, note = "" } = req.body;

  if (!expenseCode || !date || amount === undefined) {
    return res.status(400).json({ message: "Expense code, date, and amount are required" });
  }

  const normalizedCode = normalizeCode(expenseCode);
  const category = await ExpenseCategory.exists({ expenseCode: normalizedCode });

  if (!category) {
    return res.status(400).json({ message: "Expense category does not exist" });
  }

  const entry = await ExpenseEntry.create({
    expenseCode: normalizedCode,
    date,
    amount,
    note
  });

  res.status(201).json(entry);
});

const getExpenses = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.expenseCode) {
    filter.expenseCode = normalizeCode(req.query.expenseCode);
  }

  const expenses = await ExpenseEntry.find(filter).sort({ date: -1, createdAt: -1 });
  res.json(expenses);
});

module.exports = { createCategory, getCategories, addExpense, getExpenses };
