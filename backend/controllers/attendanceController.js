const crypto = require("crypto");
const AttendanceSession = require("../models/AttendanceSession");
const Attendance = require("../models/Attendance");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const StudentProfile = require("../models/StudentProfile");
const { ATTENDANCE_STATUS, ATTENDANCE_SESSION, ROLES } = require("../config/constants");
const {
  getWindowNumber,
  getSecondsRemainingInWindow,
  generateTokenForWindow,
  generateQRDataUrl,
  verifyRotatingToken
} = require("../utils/qrHelper");
const { createNotification } = require("../utils/notificationHelper");

// @desc    Start / Initialize an attendance session for an event (Teacher/Admin)
// @route   POST /api/events/:id/attendance/start
// @access  Private (Admin or Assigned Teacher)
const startAttendanceSession = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    // End any previously active session for this event
    await AttendanceSession.updateMany({ event: eventId, isActive: true }, { isActive: false });

    // Create fresh session with 2 hours lifetime (or manual stop)
    const secret = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const session = await AttendanceSession.create({
      event: eventId,
      createdBy: req.user._id,
      sessionSecret: secret,
      isActive: true,
      startedAt: new Date(),
      expiresAt,
      rotationIntervalSeconds: ATTENDANCE_SESSION.ROTATION_INTERVAL_SECONDS
    });

    res.status(201).json({
      success: true,
      message: "Live rotating attendance session started.",
      sessionId: session._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stop / End an attendance session (Teacher/Admin)
// @route   POST /api/events/:id/attendance/stop
// @access  Private (Admin or Assigned Teacher)
const stopAttendanceSession = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    await AttendanceSession.updateMany({ event: eventId, isActive: true }, { isActive: false });

    res.json({
      success: true,
      message: "Attendance session has been ended."
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live rotating QR code and remaining seconds (Teacher/Admin)
// @route   GET /api/events/:id/attendance/live-qr
// @access  Private (Admin or Assigned Teacher)
const getLiveQR = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const session = await AttendanceSession.findOne({
      event: eventId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No active attendance session found. Please start a session first."
      });
    }

    const currentWindow = getWindowNumber(session.rotationIntervalSeconds);
    const secondsRemaining = getSecondsRemainingInWindow(session.rotationIntervalSeconds);
    const token = generateTokenForWindow(session.sessionSecret, currentWindow);

    // Payload embedded inside the QR code
    const qrPayload = {
      institution: "JOY University",
      eventId: session.event.toString(),
      sessionId: session._id.toString(),
      token,
      window: currentWindow
    };

    const qrCodeDataUrl = await generateQRDataUrl(qrPayload);

    res.json({
      success: true,
      sessionId: session._id,
      token,
      secondsRemaining,
      rotationIntervalSeconds: session.rotationIntervalSeconds,
      qrCodeDataUrl,
      rawPayload: qrPayload
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance via QR scan or token submission (Student)
// @route   POST /api/attendance/scan
// @access  Private/Student
const scanAttendance = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { eventId, sessionId, token } = req.body;

    if (!eventId || !token) {
      return res.status(400).json({
        success: false,
        message: "Event ID and verification token are required."
      });
    }

    // Check active session
    let session = null;
    if (sessionId) {
      session = await AttendanceSession.findById(sessionId);
    } else {
      session = await AttendanceSession.findOne({
        event: eventId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });
    }

    if (!session || !session.isActive || new Date() > new Date(session.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: "Attendance session is closed or has expired."
      });
    }

    // Verify token validity against session secret
    const isValidToken = verifyRotatingToken(
      session.sessionSecret,
      token,
      session.rotationIntervalSeconds
    );

    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        message: "QR code has expired or token is invalid. Please scan the current live QR code on screen."
      });
    }

    // Verify event registration
    const registration = await Registration.findOne({
      event: eventId,
      student: studentId
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: "You are not registered for this event. Only registered students can mark attendance."
      });
    }

    if (registration.status === "rejected" || registration.status === "cancelled") {
      return res.status(403).json({
        success: false,
        message: `Your registration for this event is ${registration.status}.`
      });
    }

    // Check duplicate attendance
    const existingAttendance = await Attendance.findOne({
      event: eventId,
      student: studentId
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: `Attendance already recorded as "${existingAttendance.status}" on ${new Date(existingAttendance.timestamp).toLocaleTimeString()}.`
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      student: studentId,
      event: eventId,
      registration: registration._id,
      sessionId: session._id,
      status: ATTENDANCE_STATUS.PRESENT,
      timestamp: new Date(),
      markedMethod: "qr_scan"
    });

    const event = await Event.findById(eventId);

    // Send confirmation notification
    await createNotification({
      recipient: studentId,
      title: "Attendance Verified!",
      message: `Your attendance for "${event.title}" has been successfully marked as PRESENT.`,
      type: "attendance",
      link: `/student/attendance`
    });

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully! Status: PRESENT.",
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records and summary for an event (Teacher/Admin)
// @route   GET /api/events/:id/attendance
// @access  Private (Admin or Assigned Teacher)
const getEventAttendance = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    // Get all registrations for this event
    const registrations = await Registration.find({ event: eventId })
      .populate("student", "name email phone avatar");

    const attendanceRecords = await Attendance.find({ event: eventId })
      .populate("student", "name email phone avatar");

    const attendanceMap = new Map();
    attendanceRecords.forEach((att) => {
      attendanceMap.set(att.student._id.toString(), att);
    });

    // Merge registration with attendance record
    const studentUserIds = registrations.map((r) => r.student._id);
    const profiles = await StudentProfile.find({ user: { $in: studentUserIds } });
    const profileMap = new Map();
    profiles.forEach((p) => {
      profileMap.set(p.user.toString(), p);
    });

    const participantList = registrations.map((reg) => {
      const studentId = reg.student._id.toString();
      const att = attendanceMap.get(studentId);
      const prof = profileMap.get(studentId);

      return {
        registrationId: reg.registrationId,
        studentId: reg.student._id,
        name: reg.student.name,
        email: reg.student.email,
        phone: reg.student.phone,
        rollNumber: prof ? prof.rollNumber : "N/A",
        department: prof ? prof.department : "N/A",
        academicYear: prof ? prof.academicYear : "N/A",
        semester: prof ? prof.semester : "N/A",
        attendanceStatus: att ? att.status : "absent",
        timestamp: att ? att.timestamp : null,
        markedMethod: att ? att.markedMethod : null,
        attendanceId: att ? att._id : null
      };
    });

    const totalRegistered = registrations.length;
    const totalPresent = attendanceRecords.filter((a) => a.status === "present").length;
    const totalLate = attendanceRecords.filter((a) => a.status === "late").length;
    const totalAbsent = totalRegistered - (totalPresent + totalLate);
    const attendancePercentage = totalRegistered > 0 ? Math.round(((totalPresent + totalLate) / totalRegistered) * 100) : 0;

    // Check if session is currently active
    const activeSession = await AttendanceSession.findOne({
      event: eventId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    res.json({
      success: true,
      stats: {
        totalRegistered,
        totalPresent,
        totalLate,
        totalAbsent: Math.max(0, totalAbsent),
        attendancePercentage
      },
      isSessionActive: !!activeSession,
      participants: participantList
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manual attendance override (Teacher/Admin)
// @route   PUT /api/attendance/:id
// @access  Private (Admin or Assigned Teacher)
const updateAttendanceStatus = async (req, res, next) => {
  try {
    const { status, eventId, studentId, registrationId } = req.body;

    if (!Object.values(ATTENDANCE_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid attendance status." });
    }

    let attendance = null;
    if (req.params.id && req.params.id !== "new") {
      attendance = await Attendance.findById(req.params.id);
      if (attendance) {
        attendance.status = status;
        attendance.markedMethod = req.user.role === ROLES.ADMIN ? "manual_admin" : "manual_teacher";
        await attendance.save();
      }
    } else if (eventId && studentId) {
      // Upsert attendance
      attendance = await Attendance.findOneAndUpdate(
        { event: eventId, student: studentId },
        {
          event: eventId,
          student: studentId,
          registration: registrationId,
          status,
          timestamp: new Date(),
          markedMethod: req.user.role === ROLES.ADMIN ? "manual_admin" : "manual_teacher"
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: `Attendance updated to ${status}.`,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student's personal attendance history
// @route   GET /api/attendance/my
// @access  Private/Student
const getMyAttendance = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const attendances = await Attendance.find({ student: studentId })
      .populate("event")
      .sort({ timestamp: -1 });

    const totalEvents = attendances.length;
    const presentCount = attendances.filter((a) => a.status === "present").length;

    res.json({
      success: true,
      stats: {
        totalAttended: totalEvents,
        presentCount,
        lateCount: totalEvents - presentCount
      },
      data: attendances
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startAttendanceSession,
  stopAttendanceSession,
  getLiveQR,
  scanAttendance,
  getEventAttendance,
  updateAttendanceStatus,
  getMyAttendance
};
