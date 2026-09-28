const mongoose = require("mongoose");

// Immutable log of every occupancy period for a seat, preserved forever
const seatHistorySchema = new mongoose.Schema(
  {
    seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat", required: true },
    library: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ClassRoom", required: true },
    admission: { type: mongoose.Schema.Types.ObjectId, ref: "Admission", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentNameSnapshot: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, default: null }, // null = currently active
    endReason: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeatHistory", seatHistorySchema);
