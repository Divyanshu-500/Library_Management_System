const express = require("express");
const {
  createStudent, getStudents, getStudent, updateStudent, deleteStudent,
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").post(upload.single("photo"), createStudent).get(getStudents);
router
  .route("/:id")
  .get(getStudent)
  .put(upload.single("photo"), updateStudent)
  .delete(deleteStudent);

module.exports = router;
