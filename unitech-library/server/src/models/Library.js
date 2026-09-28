const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    openingTime: { type: String, default: "06:00" },
    closingTime: { type: String, default: "22:00" },
    description: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

librarySchema.virtual("classes", {
  ref: "ClassRoom",
  localField: "_id",
  foreignField: "library",
});
librarySchema.set("toJSON", { virtuals: true });
librarySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Library", librarySchema);
