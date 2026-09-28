const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
  {
    admission: { type: mongoose.Schema.Types.ObjectId, ref: "Admission", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true, min: 0 },
    paidForMonth: { type: String, required: true }, // e.g. "2026-09"
    paidDate: { type: Date, required: true, default: Date.now },
    paymentMode: { type: String, enum: ["cash", "online", "upi", "card", "other"], default: "cash" },
    receiptNumber: { type: String, unique: true, sparse: true },
    remarks: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeePayment", feePaymentSchema);
