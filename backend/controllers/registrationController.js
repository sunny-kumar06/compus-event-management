const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { generateRegistrationId } = require("../utils/idGenerator");
const { createNotification } = require("../utils/notificationHelper");
const { REGISTRATION_STATUS, ROLES, PAGINATION } = require("../config/constants");

// @desc    Register logged-in student for an event
// @route   POST /api/events/:id/register
// @access  Private/Student
const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user._id;
    const { customFormData } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    // Check if event is open for registration
    if (event.status === "cancelled" || event.status === "completed") {
      return res.status(400).json({
        success: false,
        message: `Registrations are not accepted. Event is currently marked as ${event.status}.`
      });
    }

    // Check deadline
    const now = new Date();
    if (event.regDeadline && now > new Date(event.regDeadline)) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline for this event has passed."
      });
    }

    // Check capacity
    const currentCount = await Registration.countDocuments({
      event: eventId,
      status: { $in: [REGISTRATION_STATUS.CONFIRMED, REGISTRATION_STATUS.PENDING] }
    });

    if (event.maxCapacity && currentCount >= event.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: "Registration is full. Event capacity has been reached."
      });
    }

    // Check duplicate
    const existingReg = await Registration.findOne({ event: eventId, student: studentId });
    if (existingReg) {
      return res.status(400).json({
        success: false,
        message: `You are already registered for this event with Registration ID: ${existingReg.registrationId}`
      });
    }

    // Validate dynamic form required fields if present
    if (event.dynamicFormSchema && event.dynamicFormSchema.length > 0) {
      const submittedData = customFormData || {};
      for (const field of event.dynamicFormSchema) {
        if (field.required) {
          const val = submittedData[field.id];
          if (val === undefined || val === null || val === "") {
            return res.status(400).json({
              success: false,
              message: `Field "${field.label}" is required.`
            });
          }
        }
      }
    }

    const regId = generateRegistrationId(new Date().getFullYear());

    const registration = await Registration.create({
      registrationId: regId,
      event: eventId,
      student: studentId,
      customFormData: customFormData || {},
      status: REGISTRATION_STATUS.CONFIRMED,
      registeredAt: new Date()
    });

    // Update event counter
    await Event.findByIdAndUpdate(eventId, {
      $inc: { currentRegistrationsCount: 1 }
    });

    // Send confirmation notification to student
    await createNotification({
      recipient: studentId,
      title: "Registration Confirmed!",
      message: `You have successfully registered for "${event.title}". Your Registration ID is ${regId}.`,
      type: "registration",
      link: `/student/registrations`
    });

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in student's registrations
// @route   GET /api/registrations/my
// @access  Private/Student
const getMyRegistrations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await Registration.countDocuments({ student: req.user._id });
    const registrations = await Registration.find({ student: req.user._id })
      .populate("event")
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: registrations,
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

// @desc    Get participants/registrations for an event (Admin or Assigned Teacher)
// @route   GET /api/events/:id/registrations
// @access  Private (Admin or Assigned Teacher)
const getEventRegistrations = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const query = { event: eventId };

    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }

    let searchStudentIds = null;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      const User = require("../models/User");
      const matchedUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }]
      }).select("_id");
      searchStudentIds = matchedUsers.map((u) => u._id);
      query.student = { $in: searchStudentIds };
    }

    const total = await Registration.countDocuments(query);
    const registrations = await Registration.find(query)
      .populate("student", "name email phone avatar")
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: registrations,
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

// @desc    Update registration status (Approve / Reject)
// @route   PUT /api/registrations/:id/status
// @access  Private (Admin or Assigned Teacher)
const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!Object.values(REGISTRATION_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const registration = await Registration.findById(req.params.id).populate("event");
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found." });
    }

    registration.status = status;
    await registration.save();

    // Notify student
    await createNotification({
      recipient: registration.student,
      title: `Registration Status: ${status.toUpperCase()}`,
      message: `Your registration for "${registration.event.title}" has been updated to "${status}".`,
      type: "registration",
      link: `/student/registrations`
    });

    res.json({
      success: true,
      message: `Registration status updated to ${status}.`,
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  updateRegistrationStatus
};
