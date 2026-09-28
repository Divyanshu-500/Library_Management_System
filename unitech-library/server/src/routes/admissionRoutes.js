const express = require("express");
const {
  createAdmission, getAdmissions, closeAdmission, transferAdmission,
} = require("../controllers/admissionController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").post(createAdmission).get(getAdmissions);
router.put("/:id/close", closeAdmission);
router.post("/:id/transfer", transferAdmission);

module.exports = router;
