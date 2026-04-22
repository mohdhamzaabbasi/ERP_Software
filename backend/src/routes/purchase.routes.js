const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const { createPurchase, getPurchases } = require("../controllers/purchase.controller");

router.use(authMiddleware);
router.route("/").get(getPurchases).post(createPurchase);

module.exports = router;
