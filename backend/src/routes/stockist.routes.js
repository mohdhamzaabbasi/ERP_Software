const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  createStockist,
  getStockists,
  updateStockist,
  deleteStockist
} = require("../controllers/stockist.controller");

router.use(authMiddleware);
router.route("/").get(getStockists).post(createStockist);
router.route("/:code").put(updateStockist).delete(deleteStockist);

module.exports = router;
