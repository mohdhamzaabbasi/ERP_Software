const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  getCustomers,
  lookupCustomer,
  getCustomerHistory
} = require("../controllers/customer.controller");

router.use(authMiddleware);
router.get("/", getCustomers);
router.get("/lookup", lookupCustomer);
router.get("/:customerId/history", getCustomerHistory);

module.exports = router;
