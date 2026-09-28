const express = require("express");
const {
  createLibrary, getLibraries, getLibrary, updateLibrary, deleteLibrary,
} = require("../controllers/libraryController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").post(createLibrary).get(getLibraries);
router.route("/:id").get(getLibrary).put(updateLibrary).delete(deleteLibrary);

module.exports = router;
