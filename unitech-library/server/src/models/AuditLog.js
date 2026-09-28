const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    adminName: { type: String },
    action: { type: String, required: true }, // e.g. "CREATE_STUDENT", "ASSIGN_SEAT"
    entityType: { type: String }, // e.g. "Student", "Seat"
    entityId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
