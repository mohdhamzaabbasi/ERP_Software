const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const { createSale, getSales } = require("../controllers/sale.controller");

router.use(authMiddleware);
router.route("/").get(getSales).post(createSale);

module.exports = router;
