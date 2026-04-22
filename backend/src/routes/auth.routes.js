const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const { getBranding, login, me } = require("../controllers/auth.controller");

router.get("/branding", getBranding);
router.post("/login", login);
router.get("/me", authMiddleware, me);

module.exports = router;
