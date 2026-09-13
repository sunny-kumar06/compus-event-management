const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { ROLES, PAGINATION } = require("../config/constants");

// @desc    Get all events with search, filtering and server-side pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const query = {};

    // Search by title, description or venue
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { venue: searchRegex }];
    }

    // Filter by category
    if (req.query.category && req.query.category !== "all") {
      query.category = req.query.category;
    }

    // Filter by status (default: show published, open, ongoing unless admin/teacher requests all)
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    } else if (!req.query.includeDrafts) {
      query.status = { $ne: "draft" };
    }

    // Filter by timeframe
    if (req.query.timeframe === "upcoming") {
      query.eventDate = { $gte: new Date() };
    } else if (req.query.timeframe === "past") {
      query.eventDate = { $lt: new Date() };
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate("facultyCoordinators", "name email phone")
      .populate("studentCoordinators", "name email phone")
      .sort({ eventDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: events,
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

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("facultyCoordinators", "name email phone avatar")
      .populate("studentCoordinators", "name email phone avatar")
      .populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    let userRegistration = null;
    if (req.user) {
      userRegistration = await Registration.findOne({
        event: event._id,
        student: req.user._id
      });
    }

    res.json({
      success: true,
      data: event,
      userRegistration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event (Admin only)
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      banner,
      eventDate,
      startTime,
      endTime,
      venue,
      regStartDate,
      regDeadline,
      maxCapacity,
      eligibility,
      rules,
      facultyCoordinators,
      studentCoordinators,
      status,
      dynamicFormSchema
    } = req.body;

    if (!title || !category || !description || !eventDate || !startTime || !endTime || !venue || !regDeadline) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all mandatory event fields."
      });
    }

    const event = await Event.create({
      title,
      category,
      description,
      banner: banner || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      eventDate,
      startTime,
      endTime,
      venue,
      regStartDate: regStartDate || Date.now(),
      regDeadline,
      maxCapacity: Number(maxCapacity) || 100,
      eligibility: eligibility || "All JOY University Students",
      rules: Array.isArray(rules) ? rules : (rules ? rules.split("\n").filter(Boolean) : []),
      facultyCoordinators: Array.isArray(facultyCoordinators) ? facultyCoordinators : [],
      studentCoordinators: Array.isArray(studentCoordinators) ? studentCoordinators : [],
      status: status || "published",
      dynamicFormSchema: Array.isArray(dynamicFormSchema) ? dynamicFormSchema : [],
      createdBy: req.user._id
    });

    const populatedEvent = await Event.findById(event._id)
      .populate("facultyCoordinators", "name email phone")
      .populate("studentCoordinators", "name email phone");

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: populatedEvent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event (Admin or Assigned Faculty)
// @route   PUT /api/events/:id
// @access  Private (Admin or assigned Faculty)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    // Role check: Admin can update everything; Assigned faculty can update details
    const isFacultyAssigned = event.facultyCoordinators.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (req.user.role !== ROLES.ADMIN && !isFacultyAssigned) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to edit this event."
      });
    }

    const updatableFields = [
      "title",
      "category",
      "description",
      "banner",
      "eventDate",
      "startTime",
      "endTime",
      "venue",
      "regStartDate",
      "regDeadline",
      "maxCapacity",
      "eligibility",
      "rules",
      "status",
      "dynamicFormSchema"
    ];

    // Only Admin can modify faculty and student coordinator assignments
    if (req.user.role === ROLES.ADMIN) {
      if (req.body.facultyCoordinators !== undefined) {
        event.facultyCoordinators = req.body.facultyCoordinators;
      }
      if (req.body.studentCoordinators !== undefined) {
        event.studentCoordinators = req.body.studentCoordinators;
      }
    }

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "rules" && typeof req.body[field] === "string") {
          event.rules = req.body[field].split("\n").filter(Boolean);
        } else {
          event[field] = req.body[field];
        }
      }
    });

    await event.save();

    const updated = await Event.findById(event._id)
      .populate("facultyCoordinators", "name email phone")
      .populate("studentCoordinators", "name email phone");

    res.json({
      success: true,
      message: "Event updated successfully.",
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event (Admin only)
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    await Event.findByIdAndDelete(req.params.id);
    // Optionally clean up registrations
    await Registration.deleteMany({ event: req.params.id });

    res.json({
      success: true,
      message: "Event and associated registrations deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events assigned to logged-in teacher
// @route   GET /api/events/teacher/assigned
// @access  Private/Teacher
const getAssignedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      facultyCoordinators: req.user._id
    })
      .populate("facultyCoordinators", "name email")
      .populate("studentCoordinators", "name email")
      .sort({ eventDate: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAssignedEvents
};
