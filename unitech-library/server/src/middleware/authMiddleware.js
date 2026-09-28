const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Admin = require("../models/Admin");

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.[process.env.COOKIE_NAME || "udl_token"];

  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select("-password");
    if (!req.admin || !req.admin.isActive) {
      res.status(401);
      throw new Error("Not authorized, admin inactive or not found");
    }
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.admin.role)) {
    res.status(403);
    throw new Error(`Role '${req.admin.role}' is not allowed to perform this action`);
  }
  next();
};

module.exports = { protect, authorize };
