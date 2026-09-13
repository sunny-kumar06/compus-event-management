const express = require("express");
const router = express.Router();
const {
  getEventResults,
  saveEventResults,
  publishEventResults
} = require("../controllers/resultController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

// Public (published) / private (draft)
router.get("/events/:id", (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, () => getEventResults(req, res, next));
  }
  getEventResults(req, res, next);
});

// Teacher / Admin result entry and publishing
router.post("/events/:id", protect, authorize(ROLES.TEACHER, ROLES.ADMIN), saveEventResults);
router.post("/events/:id/publish", protect, authorize(ROLES.TEACHER, ROLES.ADMIN), publishEventResults);

module.exports = router;
