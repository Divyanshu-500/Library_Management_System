const express = require("express");
const { dashboardStats, pendingFeesReport, collectionByLibrary } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.get("/dashboard", dashboardStats);
router.get("/pending-fees", pendingFeesReport);
router.get("/collection-by-library", collectionByLibrary);

module.exports = router;
