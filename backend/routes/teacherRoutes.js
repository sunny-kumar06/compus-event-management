const express = require("express");
const router = express.Router();
const { getTeachers, getTeacherById } = require("../controllers/teacherController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

// List teachers (for Admin management and coordinator dropdown selection)
router.get("/", protect, getTeachers);
router.get("/:id", protect, getTeacherById);

module.exports = router;
