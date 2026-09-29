const jwt = require("jsonwebtoken");

const generateToken = (res, adminId) => {
  const token = jwt.sign(
    { id: adminId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(
    process.env.COOKIE_NAME || "udl_token",
    token,
    {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }
  );

  return token;
};

module.exports = generateToken;