
const asyncHandler = require("express-async-handler");
const Student = require("../models/Student");
const Admission = require("../models/Admission");
const logAction = require("../utils/logAction");

// Generate a unique student code
const genStudentCode = async () => {
  // Find the highest existing student code
  const lastStudent = await Student.findOne({
    studentCode: { $regex: /^STU\d+$/ },
  })
    .collation({ locale: "en", numericOrdering: true })
    .sort({ studentCode: -1 })
    .select("studentCode")
    .lean();

  let nextNumber = 1;

  if (lastStudent?.studentCode) {
    const lastNumber = parseInt(
      lastStudent.studentCode.replace(/^STU/, ""),
      10
    );

    if (Number.isFinite(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Ensure that the generated code is not already in use
  let studentCode;

  do {
    studentCode = `STU${String(nextNumber).padStart(5, "0")}`;
    nextNumber++;
  } while (await Student.exists({ studentCode }));

  return studentCode;
};

// @desc    Create student
// @route   POST /api/students
// @access  Private
const createStudent = asyncHandler(async (req, res) => {
  const studentCode = await genStudentCode();
  const photoUrl = req.file?.path || req.body.photoUrl || "";

  const student = await Student.create({
    ...req.body,
    studentCode,
    photoUrl,
  });

  await logAction({
    admin: req.admin,
    action: "CREATE_STUDENT",
    entityType: "Student",
    entityId: student._id,
    description: `Created student profile for ${student.fullName}`,
  });

  res.status(201).json({
    success: true,
    data: student,
  });
});

// @desc    Get all students (search by name/mobile/code)
// @route   GET /api/students?search=
// @access  Private
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

  res.json({
    success: true,
    count: students.length,
    data: students,
  });
});

// @desc    Get single student with admissions
// @route   GET /api/students/:id
// @access  Private
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  const admissions = await Admission.find({
    student: student._id,
  })
    .populate("library", "name")
    .populate("classRoom", "name")
    .populate("seat", "seatNumber")
    .sort("-admissionDate");

  res.json({
    success: true,
    data: {
      student,
      admissions,
    },
  });
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  // Do not allow clients to change the generated student code
  delete updates.studentCode;

  if (req.file?.path) {
    updates.photoUrl = req.file.path;
  }

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

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

  res.json({
    success: true,
    data: student,
  });
});

// @desc    Delete student (blocked if active admission exists)
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = asyncHandler(async (req, res) => {
  const activeAdmission = await Admission.findOne({
    student: req.params.id,
    status: "active",
  });

  if (activeAdmission) {
    res.status(400);
    throw new Error(
      "Cannot delete a student with an active admission. Close admission first."
    );
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

  res.json({
    success: true,
    message: "Student deleted",
  });
});

module.exports = {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
};
