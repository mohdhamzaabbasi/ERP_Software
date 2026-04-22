const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} = require("../controllers/product.controller");

router.use(authMiddleware);
router.route("/").get(getProducts).post(createProduct);
router.route("/:code").put(updateProduct).delete(deleteProduct);

module.exports = router;
