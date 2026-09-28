const asyncHandler = require("express-async-handler");
const Student = require("../models/Student");
const Admission = require("../models/Admission");
const logAction = require("../utils/logAction");

const genStudentCode = async () => {
  const count = await Student.countDocuments();
  return `STU${String(count + 1).padStart(5, "0")}`;
};

// @desc Create student   POST /api/students
const createStudent = asyncHandler(async (req, res) => {
  const studentCode = await genStudentCode();
  const photoUrl = req.file?.path || req.body.photoUrl || "";

  const student = await Student.create({ ...req.body, studentCode, photoUrl });

  await logAction({
    admin: req.admin,
    action: "CREATE_STUDENT",
    entityType: "Student",
    entityId: student._id,
    description: `Created student profile for ${student.fullName}`,
  });

  res.status(201).json({ success: true, data: student });
});

// @desc Get all students (search by name/mobile/code)   GET /api/students?search=
const getStudents = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = search
    ? {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
          { studentCode: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const students = await Student.find(filter).sort("-createdAt");
  res.json({ success: true, count: students.length, data: students });
});

// @desc Get single student with admission + fee summary   GET /api/students/:id
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  const admissions = await Admission.find({ student: student._id })
    .populate("library", "name")
    .populate("classRoom", "name")
    .populate("seat", "seatNumber")
    .sort("-admissionDate");

  res.json({ success: true, data: { student, admissions } });
});

// @desc Update student   PUT /api/students/:id
const updateStudent = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (req.file?.path) updates.photoUrl = req.file.path;

  const student = await Student.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  await logAction({
    admin: req.admin,
    action: "UPDATE_STUDENT",
    entityType: "Student",
    entityId: student._id,
    description: `Updated profile of ${student.fullName}`,
  });

  res.json({ success: true, data: student });
});

// @desc Delete student (blocked if has active admission)   DELETE /api/students/:id
const deleteStudent = asyncHandler(async (req, res) => {
  const activeAdmission = await Admission.findOne({ student: req.params.id, status: "active" });
  if (activeAdmission) {
    res.status(400);
    throw new Error("Cannot delete a student with an active admission. Close admission first.");
  }
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  await logAction({
    admin: req.admin,
    action: "DELETE_STUDENT",
    entityType: "Student",
    entityId: student._id,
    description: `Deleted student ${student.fullName}`,
  });

  res.json({ success: true, message: "Student deleted" });
});

module.exports = { createStudent, getStudents, getStudent, updateStudent, deleteStudent };
