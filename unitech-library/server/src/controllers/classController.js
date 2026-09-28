const asyncHandler = require("express-async-handler");
const ClassRoom = require("../models/ClassRoom");
const Seat = require("../models/Seat");
const logAction = require("../utils/logAction");

// @desc Create class + auto-generate its seats     POST /api/classes
const createClass = asyncHandler(async (req, res) => {
  const { library, name, floor, capacity, description } = req.body;

  const classRoom = await ClassRoom.create({ library, name, floor, capacity, description });

  // Dynamically generate seats S01, S02, ... based on capacity
  const seatDocs = Array.from({ length: capacity }, (_, i) => ({
    classRoom: classRoom._id,
    library,
    seatNumber: `S${String(i + 1).padStart(2, "0")}`,
    status: "available",
  }));
  await Seat.insertMany(seatDocs);

  await logAction({
    admin: req.admin,
    action: "CREATE_CLASS",
    entityType: "ClassRoom",
    entityId: classRoom._id,
    description: `Created class "${classRoom.name}" with ${capacity} seats`,
  });

  res.status(201).json({ success: true, data: classRoom });
});

// @desc Get classes (optionally filter by library)  GET /api/classes?library=xxx
const getClasses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.library) filter.library = req.query.library;

  const classes = await ClassRoom.find(filter).populate("library", "name code").sort("name").lean();

  const withStats = await Promise.all(
    classes.map(async (c) => {
      const totalSeats = await Seat.countDocuments({ classRoom: c._id });
      const occupiedSeats = await Seat.countDocuments({ classRoom: c._id, status: "occupied" });
      return { ...c, totalSeats, occupiedSeats, availableSeats: totalSeats - occupiedSeats };
    })
  );

  res.json({ success: true, count: withStats.length, data: withStats });
});

// @desc Get single class     GET /api/classes/:id
const getClassById = asyncHandler(async (req, res) => {
  const classRoom = await ClassRoom.findById(req.params.id).populate("library", "name code");
  if (!classRoom) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.json({ success: true, data: classRoom });
});

// @desc Update class (capacity change adds/blocks seats accordingly)  PUT /api/classes/:id
const updateClass = asyncHandler(async (req, res) => {
  const classRoom = await ClassRoom.findById(req.params.id);
  if (!classRoom) {
    res.status(404);
    throw new Error("Class not found");
  }

  const oldCapacity = classRoom.capacity;
  Object.assign(classRoom, req.body);
  await classRoom.save();

  // If capacity increased, dynamically create the new seats
  if (req.body.capacity && req.body.capacity > oldCapacity) {
    const newSeats = [];
    for (let i = oldCapacity + 1; i <= req.body.capacity; i++) {
      newSeats.push({
        classRoom: classRoom._id,
        library: classRoom.library,
        seatNumber: `S${String(i).padStart(2, "0")}`,
        status: "available",
      });
    }
    if (newSeats.length) await Seat.insertMany(newSeats);
  }

  await logAction({
    admin: req.admin,
    action: "UPDATE_CLASS",
    entityType: "ClassRoom",
    entityId: classRoom._id,
    description: `Updated class "${classRoom.name}"`,
  });

  res.json({ success: true, data: classRoom });
});

// @desc Delete class          DELETE /api/classes/:id
const deleteClass = asyncHandler(async (req, res) => {
  const classRoom = await ClassRoom.findById(req.params.id);
  if (!classRoom) {
    res.status(404);
    throw new Error("Class not found");
  }
  const occupied = await Seat.countDocuments({ classRoom: classRoom._id, status: "occupied" });
  if (occupied > 0) {
    res.status(400);
    throw new Error("Cannot delete class with occupied seats. Vacate seats first.");
  }
  await Seat.deleteMany({ classRoom: classRoom._id });
  await classRoom.deleteOne();

  await logAction({
    admin: req.admin,
    action: "DELETE_CLASS",
    entityType: "ClassRoom",
    entityId: classRoom._id,
    description: `Deleted class "${classRoom.name}"`,
  });

  res.json({ success: true, message: "Class and its seats deleted" });
});

module.exports = { createClass, getClasses, getClassById, updateClass, deleteClass };
