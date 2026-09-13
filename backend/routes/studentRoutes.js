const express = require("express");
const router = express.Router();
const { getStudents, getStudentById } = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

// Admin or Teacher can list students
router.get("/", protect, authorize(ROLES.ADMIN, ROLES.TEACHER), getStudents);

// Authenticated users can view student profile (student views own, admin/teacher views any)
router.get("/:id", protect, getStudentById);

module.exports = router;
