require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const seed = async () => {
  await connectDB();

  const exists = await Admin.findOne({ username: "admin" });
  if (exists) {
    console.log("Default admin already exists.");
    process.exit(0);
  }

  await Admin.create({
    name: "Super Admin",
    username: "admin",
    email: "admin@unitechlibrary.com",
    password: "Admin@123", // change this immediately after first login
    role: "superadmin",
    requiresPasswordChange: true,
  });

  console.log("✅ Default admin created — username: admin | password: Admin@123");
  console.log("⚠️  Please log in and change this password immediately.");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
