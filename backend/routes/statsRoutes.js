const express = require("express");
const router = express.Router();
const { getAdminStats } = require("../controllers/statsController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

router.get("/admin", protect, authorize(ROLES.ADMIN), getAdminStats);

module.exports = router;
