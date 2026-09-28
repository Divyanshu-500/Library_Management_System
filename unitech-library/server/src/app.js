const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const classRoutes = require("./routes/classRoutes");
const seatRoutes = require("./routes/seatRoutes");
const studentRoutes = require("./routes/studentRoutes");
const admissionRoutes = require("./routes/admissionRoutes");
const feeRoutes = require("./routes/feeRoutes");
const reportRoutes = require("./routes/reportRoutes");
const auditRoutes = require("./routes/auditRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "Unitech Library API" }));

app.use("/api/auth", authRoutes);
app.use("/api/libraries", libraryRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/public", publicRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
