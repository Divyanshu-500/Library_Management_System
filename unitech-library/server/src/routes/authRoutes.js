const express = require("express");
const { loginAdmin, logoutAdmin, getMe, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/login", loginAdmin);
router.post("/change-password", protect, changePassword);
router.post("/logout", logoutAdmin);
router.get("/me", protect, getMe);

module.exports = router;
