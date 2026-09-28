const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Admission = require("../models/Admission");
const Seat = require("../models/Seat");
const SeatHistory = require("../models/SeatHistory");
const Student = require("../models/Student");
const logAction = require("../utils/logAction");

// @desc Create admission -> assigns a student to a vacant seat
// @route POST /api/admissions
const createAdmission = asyncHandler(async (req, res) => {
  const { student, library, classRoom, seat, admissionDate, monthlyFee } = req.body;

  const seatDoc = await Seat.findById(seat);
  if (!seatDoc) {
    res.status(404);
    throw new Error("Seat not found");
  }
  if (seatDoc.status === "occupied") {
    const occupiedAdmission = await Admission.findById(seatDoc.currentAdmission).populate(
      "student",
      "fullName"
    );
    res.status(400);
    throw new Error(
      `Seat ${seatDoc.seatNumber} is already occupied by ${occupiedAdmission?.student?.fullName || "another student"}. Close or transfer that admission first.`
    );
  }
  if (seatDoc.status === "inactive") {
    res.status(400);
    throw new Error(`Seat ${seatDoc.seatNumber} is marked inactive and cannot be assigned.`);
  }

  const studentDoc = await Student.findById(student);
  if (!studentDoc) {
    res.status(404);
    throw new Error("Student not found");
  }

  const admission = await Admission.create({
    student,
    library,
    classRoom,
    seat,
    admissionDate: admissionDate || Date.now(),
    monthlyFee,
    status: "active",
  });

  seatDoc.status = "occupied";
  seatDoc.currentAdmission = admission._id;
  await seatDoc.save();

  await SeatHistory.create({
    seat: seatDoc._id,
    library,
    classRoom,
    admission: admission._id,
    student,
    studentNameSnapshot: studentDoc.fullName,
    fromDate: admission.admissionDate,
    toDate: null,
  });

  await logAction({
    admin: req.admin,
    action: "CREATE_ADMISSION",
    entityType: "Admission",
    entityId: admission._id,
    description: `Assigned seat ${seatDoc.seatNumber} to ${studentDoc.fullName}`,
  });

  const populated = await admission.populate([
    { path: "student" },
    { path: "seat" },
    { path: "library", select: "name" },
    { path: "classRoom", select: "name" },
  ]);

  res.status(201).json({ success: true, data: populated });
});

// @desc Get all admissions (filterable)   GET /api/admissions
const getAdmissions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.library) filter.library = req.query.library;
  if (req.query.student) filter.student = req.query.student;

  const admissions = await Admission.find(filter)
    .populate("student", "fullName mobile photoUrl studentCode")
    .populate("library", "name code")
    .populate("classRoom", "name")
    .populate("seat", "seatNumber")
    .sort("-createdAt");

  res.json({ success: true, count: admissions.length, data: admissions });
});

// @desc Close admission / student leaves -> vacates seat, preserves history
// @route PUT /api/admissions/:id/close
const closeAdmission = asyncHandler(async (req, res) => {
  const { leavingDate, reason, status } = req.body; // status: 'left' | 'completed' | 'suspended'

  const admission = await Admission.findById(req.params.id).populate("student", "fullName");
  if (!admission) {
    res.status(404);
    throw new Error("Admission not found");
  }
  if (admission.status !== "active") {
    res.status(400);
    throw new Error("This admission is already closed");
  }

  admission.leavingDate = leavingDate || Date.now();
  admission.reason = reason || "";
  admission.status = status || "left";
  await admission.save();

  const seatDoc = await Seat.findById(admission.seat);
  if (seatDoc) {
    seatDoc.status = "available";
    seatDoc.currentAdmission = null;
    await seatDoc.save();
  }

  await SeatHistory.findOneAndUpdate(
    { admission: admission._id, toDate: null },
    { toDate: admission.leavingDate, endReason: reason || admission.status }
  );

  await logAction({
    admin: req.admin,
    action: "CLOSE_ADMISSION",
    entityType: "Admission",
    entityId: admission._id,
    description: `${admission.student.fullName} marked as "${admission.status}" — seat vacated`,
  });

  res.json({ success: true, data: admission });
});

// @desc Transfer student to a different seat (closes old admission, opens new one, keeps history)
// @route POST /api/admissions/:id/transfer
const transferAdmission = asyncHandler(async (req, res) => {
  const { newSeat, newClassRoom, newLibrary, transferDate, monthlyFee } = req.body;

  const oldAdmission = await Admission.findById(req.params.id).populate("student", "fullName");
  if (!oldAdmission || oldAdmission.status !== "active") {
    res.status(400);
    throw new Error("Active admission not found for transfer");
  }

  const targetSeat = await Seat.findById(newSeat);
  if (!targetSeat || targetSeat.status !== "available") {
    res.status(400);
    throw new Error("Target seat is not available");
  }

  const effectiveDate = transferDate || Date.now();

  // Close old
  oldAdmission.status = "transferred";
  oldAdmission.leavingDate = effectiveDate;
  oldAdmission.reason = "Transferred to another seat";
  await oldAdmission.save();

  const oldSeat = await Seat.findById(oldAdmission.seat);
  if (oldSeat) {
    oldSeat.status = "available";
    oldSeat.currentAdmission = null;
    await oldSeat.save();
  }

  await SeatHistory.findOneAndUpdate(
    { admission: oldAdmission._id, toDate: null },
    { toDate: effectiveDate, endReason: "Transferred" }
  );

  // Create new admission
  const newAdmission = await Admission.create({
    student: oldAdmission.student._id,
    library: newLibrary,
    classRoom: newClassRoom,
    seat: newSeat,
    admissionDate: effectiveDate,
    monthlyFee: monthlyFee || oldAdmission.monthlyFee,
    status: "active",
  });

  targetSeat.status = "occupied";
  targetSeat.currentAdmission = newAdmission._id;
  await targetSeat.save();

  await SeatHistory.create({
    seat: targetSeat._id,
    library: newLibrary,
    classRoom: newClassRoom,
    admission: newAdmission._id,
    student: oldAdmission.student._id,
    studentNameSnapshot: oldAdmission.student.fullName,
    fromDate: effectiveDate,
    toDate: null,
  });

  await logAction({
    admin: req.admin,
    action: "TRANSFER_ADMISSION",
    entityType: "Admission",
    entityId: newAdmission._id,
    description: `Transferred ${oldAdmission.student.fullName} from seat ${oldSeat?.seatNumber} to seat ${targetSeat.seatNumber}`,
  });

  res.json({ success: true, data: newAdmission });
});

module.exports = { createAdmission, getAdmissions, closeAdmission, transferAdmission };
