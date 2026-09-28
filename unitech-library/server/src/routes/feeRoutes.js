const express = require("express");
const { recordPayment, getFeeHistory, updatePayment, deletePayment } = require("../controllers/feeController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").post(recordPayment).get(getFeeHistory);
router.route("/:id").put(updatePayment).delete(deletePayment);

module.exports = router;
