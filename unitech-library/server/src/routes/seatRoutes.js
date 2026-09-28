const express = require("express");
const { getSeats, getSeatDetail, updateSeat, deleteSeat } = require("../controllers/seatController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").get(getSeats);
router.route("/:id").get(getSeatDetail).put(updateSeat).delete(deleteSeat);

module.exports = router;
