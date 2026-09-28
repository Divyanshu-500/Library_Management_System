const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    library: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ClassRoom", required: true },
    seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat", required: true },
    admissionDate: { type: Date, required: true, default: Date.now },
    leavingDate: { type: Date, default: null },
    monthlyFee: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["active", "completed", "left", "transferred", "suspended"],
      default: "active",
    },
    reason: { type: String, trim: true }, // reason for leaving/transfer
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admission", admissionSchema);
