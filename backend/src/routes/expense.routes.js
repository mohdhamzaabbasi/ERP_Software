const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  createCategory,
  getCategories,
  addExpense,
  getExpenses
} = require("../controllers/expense.controller");

router.use(authMiddleware);
router.route("/categories").get(getCategories).post(createCategory);
router.route("/").get(getExpenses).post(addExpense);

module.exports = router;
