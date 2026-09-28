const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ClassRoom", required: true },
    library: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    seatNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "inactive"],
      default: "available",
    },
    currentAdmission: { type: mongoose.Schema.Types.ObjectId, ref: "Admission", default: null },
  },
  { timestamps: true }
);

seatSchema.index({ classRoom: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model("Seat", seatSchema);
