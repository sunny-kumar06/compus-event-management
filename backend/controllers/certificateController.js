const Certificate = require("../models/Certificate");
const Event = require("../models/Event");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const SystemSettings = require("../models/SystemSettings");
const { generateCertificateId, generateVerificationHash } = require("../utils/idGenerator");
const { generateQRDataUrl } = require("../utils/qrHelper");
const { PAGINATION } = require("../config/constants");

// @desc    Get logged in student's certificates
// @route   GET /api/certificates/my
// @access  Private/Student
const getMyCertificates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await Certificate.countDocuments({ student: req.user._id });
    const certificates = await Certificate.find({ student: req.user._id })
      .populate("event")
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: certificates,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single certificate by ID
// @route   GET /api/certificates/:id
// @access  Private
const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate("student", "name email")
      .populate("event");

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }

    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public certificate verification endpoint
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate("event", "title category eventDate venue")
      .populate("student", "name");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        isValid: false,
        message: `Certificate with ID "${certificateId}" is not recognized or not found in JOY University records.`
      });
    }

    // Get active institution settings
    const settings = await SystemSettings.getCurrentSettings();

    // Verify hash integrity
    const expectedHash = generateVerificationHash(
      certificate.certificateId,
      certificate.student._id.toString(),
      certificate.event._id.toString()
    );

    const isHashIntact = certificate.verificationHash === expectedHash;

    res.json({
      success: true,
      isValid: isHashIntact,
      verificationStatus: isHashIntact ? "VERIFIED_AUTHENTIC" : "TAMPERED_RECORD",
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.metadata?.studentName || certificate.student.name,
        department: certificate.metadata?.department || "JOY University Student",
        eventTitle: certificate.metadata?.eventTitle || certificate.event.title,
        eventCategory: certificate.metadata?.eventCategory || certificate.event.category,
        achievementTitle: certificate.achievementTitle,
        position: certificate.position,
        issueDate: certificate.issueDate,
        signers: certificate.signers,
        institutionName: settings.institutionName,
        verifiedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all certificates (Admin)
// @route   GET /api/certificates
// @access  Private/Admin
const getAllCertificates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [{ certificateId: searchRegex }, { achievementTitle: searchRegex }];
    }

    const total = await Certificate.countDocuments(query);
    const certificates = await Certificate.find(query)
      .populate("student", "name email")
      .populate("event", "title category")
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: certificates,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
  getAllCertificates
};
