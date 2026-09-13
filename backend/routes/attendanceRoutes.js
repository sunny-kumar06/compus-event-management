const express = require("express");
const router = express.Router();
const {
  startAttendanceSession,
  stopAttendanceSession,
  getLiveQR,
  scanAttendance,
  getEventAttendance,
  updateAttendanceStatus,
  getMyAttendance
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

// Student routes
router.post("/scan", protect, authorize(ROLES.STUDENT), scanAttendance);
router.get("/my", protect, authorize(ROLES.STUDENT), getMyAttendance);

// Teacher/Admin routes
router.post("/events/:id/start", protect, authorize(ROLES.TEACHER, ROLES.ADMIN), startAttendanceSession);
router.post("/events/:id/stop", protect, authorize(ROLES.TEACHER, ROLES.ADMIN), stopAttendanceSession);
router.get("/events/:id/live-qr", protect, authorize(ROLES.TEACHER, ROLES.ADMIN), getLiveQR);
router.get("/events/:id", protect, authorize(ROLES.TEACHER, ROLES.ADMIN), getEventAttendance);
router.put("/:id", protect, authorize(ROLES.TEACHER, ROLES.ADMIN), updateAttendanceStatus);

module.exports = router;
