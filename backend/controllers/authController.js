const jwt = require("jsonwebtoken");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const TeacherProfile = require("../models/TeacherProfile");
const { ROLES } = require("../config/constants");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "joy_university_hub_super_secret_key_2026",
    { expiresIn: "7d" }
  );
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      department,
      academicYear,
      semester,
      phone
    } = req.body;

    if (!name || !email || !password || !rollNumber || !department) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, password, rollNumber, department."
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const existingRoll = await StudentProfile.findOne({ rollNumber: rollNumber.trim() });
    if (existingRoll) {
      return res.status(400).json({
        success: false,
        message: "A student with this Roll Number is already registered."
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: ROLES.STUDENT,
      phone: phone || ""
    });

    const studentProfile = await StudentProfile.create({
      user: user._id,
      rollNumber: rollNumber.trim(),
      department,
      academicYear: academicYear || "1st_year",
      semester: Number(semester) || 1,
      contactPhone: phone || ""
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Student account created successfully.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile: studentProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email and password."
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated. Please contact campus admin."
      });
    }

    let profile = null;
    if (user.role === ROLES.STUDENT) {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === ROLES.TEACHER) {
      profile = await TeacherProfile.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === ROLES.STUDENT) {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === ROLES.TEACHER) {
      profile = await TeacherProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, bio, department, semester } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    let profile = null;
    if (user.role === ROLES.STUDENT) {
      profile = await StudentProfile.findOne({ user: user._id });
      if (profile) {
        if (bio !== undefined) profile.bio = bio;
        if (department) profile.department = department;
        if (semester) profile.semester = Number(semester);
        if (phone !== undefined) profile.contactPhone = phone;
        await profile.save();
      }
    } else if (user.role === ROLES.TEACHER) {
      profile = await TeacherProfile.findOne({ user: user._id });
      if (profile && phone) {
        profile.phone = phone;
        await profile.save();
      }
    }

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
