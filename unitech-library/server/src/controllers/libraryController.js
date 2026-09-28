const asyncHandler = require("express-async-handler");
const Library = require("../models/Library");
const ClassRoom = require("../models/ClassRoom");
const Seat = require("../models/Seat");
const logAction = require("../utils/logAction");

// @desc Create library        POST /api/libraries
const createLibrary = asyncHandler(async (req, res) => {
  const library = await Library.create(req.body);
  await logAction({
    admin: req.admin,
    action: "CREATE_LIBRARY",
    entityType: "Library",
    entityId: library._id,
    description: `Created library "${library.name}"`,
  });
  res.status(201).json({ success: true, data: library });
});

// @desc Get all libraries (with occupancy stats)   GET /api/libraries
const getLibraries = asyncHandler(async (req, res) => {
  const libraries = await Library.find().sort("-createdAt").lean();

  const withStats = await Promise.all(
    libraries.map(async (lib) => {
      const classCount = await ClassRoom.countDocuments({ library: lib._id });
      const totalSeats = await Seat.countDocuments({ library: lib._id });
      const occupiedSeats = await Seat.countDocuments({ library: lib._id, status: "occupied" });
      return { ...lib, classCount, totalSeats, occupiedSeats, availableSeats: totalSeats - occupiedSeats };
    })
  );

  res.json({ success: true, count: withStats.length, data: withStats });
});

// @desc Get single library    GET /api/libraries/:id
const getLibrary = asyncHandler(async (req, res) => {
  const library = await Library.findById(req.params.id);
  if (!library) {
    res.status(404);
    throw new Error("Library not found");
  }
  res.json({ success: true, data: library });
});

// @desc Update library        PUT /api/libraries/:id
const updateLibrary = asyncHandler(async (req, res) => {
  const library = await Library.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!library) {
    res.status(404);
    throw new Error("Library not found");
  }
  await logAction({
    admin: req.admin,
    action: "UPDATE_LIBRARY",
    entityType: "Library",
    entityId: library._id,
    description: `Updated library "${library.name}"`,
  });
  res.json({ success: true, data: library });
});

// @desc Delete library        DELETE /api/libraries/:id
const deleteLibrary = asyncHandler(async (req, res) => {
  const library = await Library.findById(req.params.id);
  if (!library) {
    res.status(404);
    throw new Error("Library not found");
  }
  const classCount = await ClassRoom.countDocuments({ library: library._id });
  if (classCount > 0) {
    res.status(400);
    throw new Error("Cannot delete library that still has classes. Delete classes first.");
  }
  await library.deleteOne();
  await logAction({
    admin: req.admin,
    action: "DELETE_LIBRARY",
    entityType: "Library",
    entityId: library._id,
    description: `Deleted library "${library.name}"`,
  });
  res.json({ success: true, message: "Library deleted" });
});

module.exports = { createLibrary, getLibraries, getLibrary, updateLibrary, deleteLibrary };
