const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Registration = require("../models/Registration");
const Attendance = require("../models/Attendance");
const Certificate = require("../models/Certificate");
const EventResult = require("../models/EventResult");
const { ROLES, PAGINATION } = require("../config/constants");

// @desc    Get all students with server-side pagination & search
// @route   GET /api/students
// @access  Private (Admin or Teacher)
const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const userQuery = { role: ROLES.STUDENT };
    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      userQuery.$or = [{ name: regex }, { email: regex }];
    }

    const matchedUsers = await User.find(userQuery).select("_id name email phone avatar isActive createdAt");
    const userIds = matchedUsers.map((u) => u._id);

    const profileQuery = { user: { $in: userIds } };
    if (req.query.department && req.query.department !== "all") {
      profileQuery.department = req.query.department;
    }
    if (req.query.academicYear && req.query.academicYear !== "all") {
      profileQuery.academicYear = req.query.academicYear;
    }

    const total = await StudentProfile.countDocuments(profileQuery);
    const profiles = await StudentProfile.find(profileQuery)
      .populate("user", "name email phone avatar isActive createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: profiles,
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

// @desc    Get single student achievement profile
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res, next) => {
  try {
    const studentUserId = req.params.id;

    const user = await User.findById(studentUserId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Student user not found." });
    }

    const profile = await StudentProfile.findOne({ user: studentUserId });

    // Fetch student's registrations
    const registrations = await Registration.find({ student: studentUserId })
      .populate("event", "title category eventDate venue status")
      .sort({ registeredAt: -1 });

    // Fetch student's attendance records
    const attendances = await Attendance.find({ student: studentUserId })
      .populate("event", "title category eventDate")
      .sort({ timestamp: -1 });

    // Fetch student's certificates
    const certificates = await Certificate.find({ student: studentUserId })
      .populate("event", "title category")
      .sort({ issueDate: -1 });

    // Fetch won achievements from results
    const resultsWithWins = await EventResult.find({
      isPublished: true,
      "winners.student": studentUserId
    }).populate("event", "title category eventDate");

    const achievementsList = [];
    resultsWithWins.forEach((resDoc) => {
      resDoc.winners.forEach((win) => {
        if (win.student.toString() === studentUserId.toString()) {
          achievementsList.push({
            eventId: resDoc.event?._id,
            eventTitle: resDoc.event?.title,
            category: resDoc.event?.category,
            date: resDoc.event?.eventDate,
            position: win.position,
            title: win.title || win.position,
            teamName: win.teamName,
            remarks: win.remarks
          });
        }
      });
    });

    const totalRegistrations = registrations.length;
    const totalAttended = attendances.filter((a) => a.status === "present").length;
    const firstPositions = achievementsList.filter(
      (a) => a.position === "1st" || a.position === "winner"
    ).length;
    const secondPositions = achievementsList.filter(
      (a) => a.position === "2nd" || a.position === "runner_up"
    ).length;
    const thirdPositions = achievementsList.filter((a) => a.position === "3rd").length;

    res.json({
      success: true,
      student: user,
      profile,
      stats: {
        eventsParticipated: totalAttended || profile?.participationStats?.totalParticipated || totalRegistrations,
        totalRegistrations,
        certificatesCount: certificates.length,
        firstPositions: firstPositions || profile?.participationStats?.firstPositions || 0,
        secondPositions: secondPositions || profile?.participationStats?.secondPositions || 0,
        thirdPositions: thirdPositions || profile?.participationStats?.thirdPositions || 0
      },
      achievements: achievementsList,
      certificates,
      recentRegistrations: registrations.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById
};
