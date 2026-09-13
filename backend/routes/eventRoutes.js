const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAssignedEvents
} = require("../controllers/eventController");
const { protect, authorize, checkFacultyOrAdminForEvent } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

// Public routes (optionally authenticated to attach userRegistration)
router.get("/", (req, res, next) => {
  // Optional auth
  if (req.headers.authorization) {
    return protect(req, res, () => getEvents(req, res, next));
  }
  getEvents(req, res, next);
});

router.get("/teacher/assigned", protect, authorize(ROLES.TEACHER, ROLES.ADMIN), getAssignedEvents);

router.get("/:id", (req, res, next) => {
  // Optional auth to attach user registration status
  if (req.headers.authorization) {
    return protect(req, res, () => getEventById(req, res, next));
  }
  getEventById(req, res, next);
});

// Admin only routes
router.post("/", protect, authorize(ROLES.ADMIN), createEvent);
router.delete("/:id", protect, authorize(ROLES.ADMIN), deleteEvent);

// Admin or assigned Faculty
router.put("/:id", protect, updateEvent);

module.exports = router;
