const express = require("express");
const {
  createClass, getClasses, getClassById, updateClass, deleteClass,
} = require("../controllers/classController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").post(createClass).get(getClasses);
router.route("/:id").get(getClassById).put(updateClass).delete(deleteClass);

module.exports = router;
