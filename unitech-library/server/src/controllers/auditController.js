const asyncHandler = require("express-async-handler");
const AuditLog = require("../models/AuditLog");

// @desc Get audit logs (paginated, newest first)   GET /api/audit-logs
const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  const logs = await AuditLog.find()
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await AuditLog.countDocuments();

  res.json({ success: true, page, totalPages: Math.ceil(total / limit), total, data: logs });
});

module.exports = { getAuditLogs };
