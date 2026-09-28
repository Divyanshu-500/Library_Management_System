const asyncHandler = require("express-async-handler");
const FeePayment = require("../models/FeePayment");
const Admission = require("../models/Admission");
const generateReceiptNumber = require("../utils/generateReceiptNumber");
const logAction = require("../utils/logAction");

// @desc Record a fee payment   POST /api/fees
const recordPayment = asyncHandler(async (req, res) => {
  const { admission, amount, paidForMonth, paidDate, paymentMode, remarks } = req.body;

  const admissionDoc = await Admission.findById(admission).populate("student", "fullName");
  if (!admissionDoc) {
    res.status(404);
    throw new Error("Admission not found");
  }

  const payment = await FeePayment.create({
    admission,
    student: admissionDoc.student._id,
    amount,
    paidForMonth,
    paidDate: paidDate || Date.now(),
    paymentMode,
    remarks,
    receiptNumber: generateReceiptNumber(),
    recordedBy: req.admin._id,
  });

  await logAction({
    admin: req.admin,
    action: "RECORD_FEE",
    entityType: "FeePayment",
    entityId: payment._id,
    description: `Recorded ₹${amount} payment from ${admissionDoc.student.fullName} for ${paidForMonth}`,
  });

  res.status(201).json({ success: true, data: payment });
});

// @desc Get fee history for a student/admission    GET /api/fees?student=xx or ?admission=xx
const getFeeHistory = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.student) filter.student = req.query.student;
  if (req.query.admission) filter.admission = req.query.admission;

  const payments = await FeePayment.find(filter).sort("-paidDate");
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  res.json({ success: true, count: payments.length, totalPaid, data: payments });
});

// @desc Update a payment record   PUT /api/fees/:id
const updatePayment = asyncHandler(async (req, res) => {
  const payment = await FeePayment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }
  await logAction({
    admin: req.admin,
    action: "UPDATE_FEE",
    entityType: "FeePayment",
    entityId: payment._id,
    description: `Updated fee payment record ${payment.receiptNumber}`,
  });
  res.json({ success: true, data: payment });
});

// @desc Delete a payment record (correcting mistakes)   DELETE /api/fees/:id
const deletePayment = asyncHandler(async (req, res) => {
  const payment = await FeePayment.findByIdAndDelete(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }
  await logAction({
    admin: req.admin,
    action: "DELETE_FEE",
    entityType: "FeePayment",
    entityId: payment._id,
    description: `Deleted fee payment record ${payment.receiptNumber}`,
  });
  res.json({ success: true, message: "Payment record deleted" });
});

module.exports = { recordPayment, getFeeHistory, updatePayment, deletePayment };
