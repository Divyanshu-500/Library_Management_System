const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentCode: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true },
    motherName: { type: String, trim: true },
    mobile: { type: String, required: true, trim: true },
    alternateMobile: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    photoUrl: { type: String, trim: true },
    address: { type: String, trim: true },
    village: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    college: { type: String, trim: true },
    course: { type: String, trim: true },
    occupation: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    idProofType: { type: String, trim: true },
    idProofNumber: { type: String, trim: true },
    registrationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
