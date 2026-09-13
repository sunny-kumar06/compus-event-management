const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

// Public can read active institution branding
router.get("/", getSettings);

// Admin can update institution branding & boilerplate config
router.put("/", protect, authorize(ROLES.ADMIN), updateSettings);

module.exports = router;
