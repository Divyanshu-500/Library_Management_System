const asyncHandler = require("express-async-handler");
const Library = require("../models/Library");
const ClassRoom = require("../models/ClassRoom");
const Seat = require("../models/Seat");
const Student = require("../models/Student");
const Admission = require("../models/Admission");
const FeePayment = require("../models/FeePayment");

// @desc Dashboard summary stats   GET /api/reports/dashboard
const dashboardStats = asyncHandler(async (req, res) => {
  const [libraries, classes, totalSeats, occupiedSeats, activeStudents] = await Promise.all([
    Library.countDocuments(),
    ClassRoom.countDocuments(),
    Seat.countDocuments(),
    Seat.countDocuments({ status: "occupied" }),
    Admission.countDocuments({ status: "active" }),
  ]);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const monthPayments = await FeePayment.find({ paidDate: { $gte: startOfMonth, $lt: endOfMonth } });
  const monthCollection = monthPayments.reduce((sum, p) => sum + p.amount, 0);

  // Pending fee count: active admissions with no payment recorded for current month
  const activeAdmissions = await Admission.find({ status: "active" });
  let pendingCount = 0;
  for (const adm of activeAdmissions) {
    const paid = await FeePayment.findOne({ admission: adm._id, paidForMonth: monthKey });
    if (!paid) pendingCount++;
  }

  res.json({
    success: true,
    data: {
      libraries,
      classes,
      totalSeats,
      occupiedSeats,
      availableSeats: totalSeats - occupiedSeats,
      activeStudents,
      pendingFees: pendingCount,
      monthCollection,
      occupancyRate: totalSeats ? Math.round((occupiedSeats / totalSeats) * 100) : 0,
    },
  });
});

// @desc Pending fees report   GET /api/reports/pending-fees
const pendingFeesReport = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const activeAdmissions = await Admission.find({ status: "active" })
    .populate("student", "fullName mobile")
    .populate("seat", "seatNumber")
    .populate("library", "name");

  const pending = [];
  for (const adm of activeAdmissions) {
    const paid = await FeePayment.findOne({ admission: adm._id, paidForMonth: monthKey });
    if (!paid) pending.push(adm);
  }

  res.json({ success: true, month: monthKey, count: pending.length, data: pending });
});

// @desc Library-wise fee collection   GET /api/reports/collection-by-library
const collectionByLibrary = asyncHandler(async (req, res) => {
  const libraries = await Library.find().lean();
  const result = [];
  for (const lib of libraries) {
    const admissions = await Admission.find({ library: lib._id }).select("_id");
    const admissionIds = admissions.map((a) => a._id);
    const payments = await FeePayment.find({ admission: { $in: admissionIds } });
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    result.push({ library: lib.name, totalCollection: total, paymentCount: payments.length });
  }
  res.json({ success: true, data: result });
});

module.exports = { dashboardStats, pendingFeesReport, collectionByLibrary };
