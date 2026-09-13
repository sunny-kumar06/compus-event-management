const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const Event = require("../models/Event");
const { ROLES, PAGINATION } = require("../config/constants");

// @desc    Get all teachers with server-side pagination & search
// @route   GET /api/teachers
// @access  Private (Admin or Authenticated)
const getTeachers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const userQuery = { role: ROLES.TEACHER };
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

    const total = await TeacherProfile.countDocuments(profileQuery);
    const profiles = await TeacherProfile.find(profileQuery)
      .populate("user", "name email phone avatar isActive createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch assigned event counts for each teacher
    const teacherData = await Promise.all(
      profiles.map(async (p) => {
        const assignedCount = await Event.countDocuments({
          facultyCoordinators: p.user._id
        });
        return {
          ...p.toObject(),
          assignedEventsCount: assignedCount
        };
      })
    );

    res.json({
      success: true,
      data: teacherData,
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

// @desc    Get teacher profile by ID
// @route   GET /api/teachers/:id
// @access  Private
const getTeacherById = async (req, res, next) => {
  try {
    const teacherUserId = req.params.id;
    const user = await User.findById(teacherUserId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Teacher user not found." });
    }

    const profile = await TeacherProfile.findOne({ user: teacherUserId });
    const assignedEvents = await Event.find({ facultyCoordinators: teacherUserId });

    res.json({
      success: true,
      teacher: user,
      profile,
      assignedEvents
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeachers,
  getTeacherById
};
