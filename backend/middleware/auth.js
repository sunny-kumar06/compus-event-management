const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Event = require("../models/Event");
const { ROLES } = require("../config/constants");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No authentication token provided."
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "joy_university_hub_super_secret_key_2026"
    );

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session invalid or user does not exist."
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Contact administrator."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token."
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to perform this action.`
      });
    }
    next();
  };
};

const checkFacultyOrAdminForEvent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    // Admins have universal access
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    const eventId = req.params.id || req.params.eventId || req.body.eventId;
    if (!eventId) {
      return res.status(400).json({ success: false, message: "Event ID is required." });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    // Check if user is among assigned faculty coordinators
    const isAssignedFaculty = event.facultyCoordinators.some(
      (coordId) => coordId.toString() === req.user._id.toString()
    );

    if (!isAssignedFaculty) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not an assigned faculty coordinator for this event."
      });
    }

    req.event = event;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  authorize,
  checkFacultyOrAdminForEvent
};
