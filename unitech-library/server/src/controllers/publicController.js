const asyncHandler = require("express-async-handler");
const Library = require("../models/Library");
const ClassRoom = require("../models/ClassRoom");
const Seat = require("../models/Seat");

// @desc Public: list active libraries with seat stats  GET /api/public/libraries
const publicLibraries = asyncHandler(async (req, res) => {
  const libraries = await Library.find({ status: "active" }).lean();
  const withStats = await Promise.all(
    libraries.map(async (lib) => {
      const totalSeats = await Seat.countDocuments({ library: lib._id });
      const occupiedSeats = await Seat.countDocuments({ library: lib._id, status: "occupied" });
      return {
        _id: lib._id,
        name: lib.name,
        code: lib.code,
        address: lib.address,
        openingTime: lib.openingTime,
        closingTime: lib.closingTime,
        totalSeats,
        availableSeats: totalSeats - occupiedSeats,
      };
    })
  );
  res.json({ success: true, data: withStats });
});

// @desc Public: classes for a library  GET /api/public/libraries/:id/classes
const publicClasses = asyncHandler(async (req, res) => {
  const classes = await ClassRoom.find({ library: req.params.id, status: "active" }).lean();
  const withStats = await Promise.all(
    classes.map(async (c) => {
      const totalSeats = await Seat.countDocuments({ classRoom: c._id });
      const occupiedSeats = await Seat.countDocuments({ classRoom: c._id, status: "occupied" });
      return {
        _id: c._id,
        name: c.name,
        floor: c.floor,
        totalSeats,
        availableSeats: totalSeats - occupiedSeats,
      };
    })
  );
  res.json({ success: true, data: withStats });
});

// @desc Public: seat layout for a class — LIMITED student info only
// GET /api/public/classes/:id/seats
const publicSeats = asyncHandler(async (req, res) => {
  const seats = await Seat.find({ classRoom: req.params.id })
    .populate({
      path: "currentAdmission",
      populate: { path: "student", select: "fullName photoUrl" }, // no mobile/address/etc
    })
    .sort("seatNumber")
    .lean();

  const publicData = seats.map((s) => ({
    _id: s._id,
    seatNumber: s.seatNumber,
    status: s.status,
    occupantName: s.currentAdmission?.student?.fullName || null,
    occupantPhoto: s.currentAdmission?.student?.photoUrl || null,
  }));

  res.json({ success: true, data: publicData });
});

module.exports = { publicLibraries, publicClasses, publicSeats };
