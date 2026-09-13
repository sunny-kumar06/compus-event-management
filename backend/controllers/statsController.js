const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Attendance = require("../models/Attendance");
const Certificate = require("../models/Certificate");
const StudentProfile = require("../models/StudentProfile");
const { ROLES } = require("../config/constants");

// @desc    Get aggregated Admin Dashboard statistics and charts
// @route   GET /api/stats/admin
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: ROLES.STUDENT });
    const totalTeachers = await User.countDocuments({ role: ROLES.TEACHER });
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    const now = new Date();
    const upcomingEvents = await Event.countDocuments({ eventDate: { $gt: now }, status: { $ne: "cancelled" } });
    const ongoingEvents = await Event.countDocuments({ status: "ongoing" });
    const completedEvents = await Event.countDocuments({ status: "completed" });

    // Category breakdown
    const categoryStats = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 }, totalRegistrations: { $sum: "$currentRegistrationsCount" } } }
    ]);

    // Branch-wise student participation
    const branchStats = await StudentProfile.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 }, totalParticipations: { $sum: "$participationStats.totalParticipated" } } },
      { $sort: { count: -1 } }
    ]);

    // Year-wise student distribution
    const yearStats = await StudentProfile.aggregate([
      { $group: { _id: "$academicYear", count: { $sum: 1 } } }
    ]);

    // Attendance breakdown
    const totalAttendanceMarks = await Attendance.countDocuments();
    const presentCount = await Attendance.countDocuments({ status: "present" });
    const lateCount = await Attendance.countDocuments({ status: "late" });

    // Recent activity feed
    const recentRegistrations = await Registration.find()
      .sort({ registeredAt: -1 })
      .limit(5)
      .populate("student", "name email")
      .populate("event", "title");

    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title category eventDate status createdAt");

    const recentCertificates = await Certificate.find()
      .sort({ issueDate: -1 })
      .limit(5)
      .populate("student", "name")
      .populate("event", "title");

    res.json({
      success: true,
      summary: {
        totalStudents,
        totalTeachers,
        totalEvents,
        totalRegistrations,
        totalCertificates,
        upcomingEvents,
        ongoingEvents,
        completedEvents,
        attendanceStats: {
          total: totalAttendanceMarks,
          present: presentCount,
          late: lateCount,
          rate: totalRegistrations > 0 ? Math.round((presentCount / totalRegistrations) * 100) : 0
        }
      },
      charts: {
        categoryStats,
        branchStats,
        yearStats
      },
      recentActivity: {
        registrations: recentRegistrations,
        events: recentEvents,
        certificates: recentCertificates
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats
};
