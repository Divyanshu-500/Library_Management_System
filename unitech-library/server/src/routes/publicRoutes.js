const express = require("express");
const { publicLibraries, publicClasses, publicSeats } = require("../controllers/publicController");
const router = express.Router();

router.get("/libraries", publicLibraries);
router.get("/libraries/:id/classes", publicClasses);
router.get("/classes/:id/seats", publicSeats);

module.exports = router;
