const express = require("express");
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  updateRegistrationStatus
} = require("../controllers/registrationController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

// Student routes
router.post("/events/:id/register", protect, authorize(ROLES.STUDENT), registerForEvent);
router.get("/my", protect, authorize(ROLES.STUDENT), getMyRegistrations);

// Teacher/Admin routes
router.get("/events/:id/registrations", protect, authorize(ROLES.TEACHER, ROLES.ADMIN), getEventRegistrations);
router.put("/:id/status", protect, authorize(ROLES.TEACHER, ROLES.ADMIN), updateRegistrationStatus);

module.exports = router;
