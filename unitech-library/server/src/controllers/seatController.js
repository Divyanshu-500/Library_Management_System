const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Seat = require("../models/Seat");
const ClassRoom = require("../models/ClassRoom");
const logAction = require("../utils/logAction");

// @desc Get seats for a class (seat grid)   GET /api/seats?classRoom=xxx
const getSeats = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.classRoom) filter.classRoom = req.query.classRoom;
  if (req.query.library) filter.library = req.query.library;

  const seats = await Seat.find(filter)
    .populate({
      path: "currentAdmission",
      populate: { path: "student", select: "fullName mobile photoUrl" },
    })
    .sort("seatNumber");

  res.json({ success: true, count: seats.length, data: seats });
});

// @desc Get single seat with full occupancy history  GET /api/seats/:id
const getSeatDetail = asyncHandler(async (req, res) => {
  const SeatHistory = require("../models/SeatHistory");
  const seat = await Seat.findById(req.params.id).populate({
    path: "currentAdmission",
    populate: { path: "student" },
  });
  if (!seat) {
    res.status(404);
    throw new Error("Seat not found");
  }
  const history = await SeatHistory.find({ seat: seat._id })
    .sort("-fromDate")
    .populate("student", "fullName mobile photoUrl");

  res.json({ success: true, data: { seat, history } });
});

// @desc Update seat (e.g. seat number, status toggle inactive)  PUT /api/seats/:id
const updateSeat = asyncHandler(async (req, res) => {
  const { seatNumber, status } = req.body;
  const seat = await Seat.findById(req.params.id);
  if (!seat) {
    res.status(404);
    throw new Error("Seat not found");
  }
  if (seat.status === "occupied" && status && status !== "occupied") {
    res.status(400);
    throw new Error("Cannot change status of an occupied seat directly. Vacate it first.");
  }
  if (seatNumber) seat.seatNumber = seatNumber;
  if (status) seat.status = status;
  await seat.save();

  await logAction({
    admin: req.admin,
    action: "UPDATE_SEAT",
    entityType: "Seat",
    entityId: seat._id,
    description: `Updated seat "${seat.seatNumber}"`,
  });

  res.json({ success: true, data: seat });
});

// @desc Delete seat (only if never had an active occupant)  DELETE /api/seats/:id
const deleteSeat = asyncHandler(async (req, res) => {
  const seat = await Seat.findById(req.params.id);
  if (!seat) {
    res.status(404);
    throw new Error("Seat not found");
  }
  if (seat.status === "occupied") {
    res.status(400);
    throw new Error("Cannot delete an occupied seat. Vacate it first.");
  }
  await seat.deleteOne();
  await ClassRoom.findByIdAndUpdate(seat.classRoom, { $inc: { capacity: -1 } });

  await logAction({
    admin: req.admin,
    action: "DELETE_SEAT",
    entityType: "Seat",
    entityId: seat._id,
    description: `Deleted seat "${seat.seatNumber}"`,
  });

  res.json({ success: true, message: "Seat deleted" });
});

module.exports = { getSeats, getSeatDetail, updateSeat, deleteSeat };
