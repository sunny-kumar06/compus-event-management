const express = require("express");
const router = express.Router();
const {
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
  getAllCertificates
} = require("../controllers/certificateController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

// Public certificate verification
router.get("/verify/:certificateId", verifyCertificate);

// Student certificates
router.get("/my", protect, authorize(ROLES.STUDENT), getMyCertificates);

// Single certificate
router.get("/:id", protect, getCertificateById);

// Admin all certificates
router.get("/", protect, authorize(ROLES.ADMIN), getAllCertificates);

module.exports = router;
