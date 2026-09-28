const mongoose = require("mongoose");

const classRoomSchema = new mongoose.Schema(
  {
    library: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    name: { type: String, required: true, trim: true },
    floor: { type: String, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    description: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

classRoomSchema.index({ library: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("ClassRoom", classRoomSchema);
