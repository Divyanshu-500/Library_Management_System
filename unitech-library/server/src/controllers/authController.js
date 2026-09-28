const asyncHandler = require("express-async-handler");
const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");

// @desc  Login admin
// @route POST /api/auth/login
const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username: username?.toLowerCase() }).select("+password");

  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid username or password");
  }
  if (!admin.isActive) {
    res.status(403);
    throw new Error("This admin account is deactivated");
  }

  const isDefaultSeedPassword = admin.username === "admin" && password === "Admin@123";
  const requiresPasswordChange = admin.requiresPasswordChange || isDefaultSeedPassword;

  if (requiresPasswordChange && !admin.requiresPasswordChange) {
    admin.requiresPasswordChange = true;
    await admin.save({ validateBeforeSave: false });
  }

  generateToken(res, admin._id);
  res.json({
    success: true,
    requiresPasswordChange,
    admin: {
      id: admin._id,
      name: admin.name,
      username: admin.username,
      role: admin.role,
      requiresPasswordChange,
    },
  });
});

// @desc  Change admin password
// @route POST /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters long");
  }

  const admin = await Admin.findById(req.admin._id).select("+password");
  const isMatch = await admin.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  if (currentPassword === newPassword) {
    res.status(400);
    throw new Error("New password must be different from the current password");
  }

  admin.password = newPassword;
  admin.requiresPasswordChange = false;
  await admin.save();

  res.json({
    success: true,
    message: "Password updated successfully",
  });
});

// @desc  Logout admin
// @route POST /api/auth/logout
const logoutAdmin = asyncHandler(async (req, res) => {
  res.cookie(process.env.COOKIE_NAME || "udl_token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: "Logged out" });
});

// @desc  Get current logged in admin
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, admin: req.admin });
});

module.exports = { loginAdmin, changePassword, logoutAdmin, getMe };
