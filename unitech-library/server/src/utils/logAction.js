const AuditLog = require("../models/AuditLog");

const logAction = async ({ admin, action, entityType, entityId, description, meta }) => {
  try {
    await AuditLog.create({
      admin: admin._id,
      adminName: admin.name,
      action,
      entityType,
      entityId,
      description,
      meta,
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};

module.exports = logAction;
