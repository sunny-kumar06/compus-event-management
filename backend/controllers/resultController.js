const EventResult = require("../models/EventResult");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const StudentProfile = require("../models/StudentProfile");
const Certificate = require("../models/Certificate");
const SystemSettings = require("../models/SystemSettings");
const { generateCertificateId, generateVerificationHash } = require("../utils/idGenerator");
const { generateQRDataUrl } = require("../utils/qrHelper");
const { createNotification } = require("../utils/notificationHelper");
const { RESULT_POSITIONS } = require("../config/constants");

// @desc    Get results for an event
// @route   GET /api/events/:id/results
// @access  Public (Published) / Private (Draft for Admin & Assigned Teacher)
const getEventResults = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    const result = await EventResult.findOne({ event: eventId })
      .populate("winners.student", "name email phone avatar")
      .populate("publishedBy", "name email");

    if (!result) {
      return res.json({
        success: true,
        data: null,
        message: "No results declared yet for this event."
      });
    }

    // If unpublished, only admin or assigned teacher can see
    if (!result.isPublished) {
      if (!req.user || (req.user.role === "student")) {
        return res.json({
          success: true,
          data: null,
          message: "Results are currently being compiled and have not been published yet."
        });
      }
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/Update event results draft (Teacher/Admin)
// @route   POST /api/events/:id/results
// @access  Private (Admin or Assigned Teacher)
const saveEventResults = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { winners, generalRemarks } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    let result = await EventResult.findOne({ event: eventId });

    if (result) {
      result.winners = winners || [];
      result.generalRemarks = generalRemarks || "";
      await result.save();
    } else {
      result = await EventResult.create({
        event: eventId,
        winners: winners || [],
        generalRemarks: generalRemarks || "",
        isPublished: false
      });
    }

    const populated = await EventResult.findById(result._id)
      .populate("winners.student", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Event results draft saved successfully.",
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish event results, update student achievements and auto-generate certificates
// @route   POST /api/events/:id/results/publish
// @access  Private (Admin or Assigned Teacher)
const publishEventResults = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    let result = await EventResult.findOne({ event: eventId });
    if (!result || !result.winners || result.winners.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add winner/participant positions before publishing results."
      });
    }

    result.isPublished = true;
    result.publishedAt = new Date();
    result.publishedBy = req.user._id;
    await result.save();

    // Mark event status as completed if not already
    event.status = "completed";
    await event.save();

    // Fetch system settings for certificate signers
    const settings = await SystemSettings.getCurrentSettings();
    const signers = settings.certificateSigners && settings.certificateSigners.length > 0
      ? settings.certificateSigners
      : [
          { name: "Dr. K. S. Ramanathan", title: "Dean of Student Affairs", institution: "JOY University" },
          { name: "Prof. Anjali Deshmukh", title: "Director, Campus Events Council", institution: "JOY University" }
        ];

    // Process winners: update StudentProfile achievements and issue certificates
    for (const item of result.winners) {
      const studentId = item.student;
      const position = item.position;

      // Map position to achievement title
      let achievementTitle = "Certificate of Participation";
      if (position === RESULT_POSITIONS.FIRST) achievementTitle = "First Place — Winner 🥇";
      else if (position === RESULT_POSITIONS.SECOND) achievementTitle = "Second Place — Runner Up 🥈";
      else if (position === RESULT_POSITIONS.THIRD) achievementTitle = "Third Place — 2nd Runner Up 🥉";
      else if (position === RESULT_POSITIONS.WINNER) achievementTitle = "Champion / Winner 🏆";
      else if (position === RESULT_POSITIONS.RUNNER_UP) achievementTitle = "Runner Up 🥈";
      else if (position === RESULT_POSITIONS.SPECIAL_MENTION) achievementTitle = "Special Mention 🌟";

      // Update StudentProfile stats
      const incField = {};
      incField["participationStats.totalParticipated"] = 1;
      if (position === RESULT_POSITIONS.FIRST || position === RESULT_POSITIONS.WINNER) {
        incField["participationStats.firstPositions"] = 1;
      } else if (position === RESULT_POSITIONS.SECOND || position === RESULT_POSITIONS.RUNNER_UP) {
        incField["participationStats.secondPositions"] = 1;
      } else if (position === RESULT_POSITIONS.THIRD) {
        incField["participationStats.thirdPositions"] = 1;
      }
      incField["participationStats.certificatesIssued"] = 1;

      await StudentProfile.findOneAndUpdate(
        { user: studentId },
        { $inc: incField },
        { upsert: true }
      );

      // Check if certificate already generated for this event + student
      let cert = await Certificate.findOne({ event: eventId, student: studentId });
      if (!cert) {
        const certId = generateCertificateId(new Date().getFullYear());
        const hash = generateVerificationHash(certId, studentId.toString(), eventId.toString());

        const qrVerificationUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-certificate/${certId}`;
        const qrCodeDataUrl = await generateQRDataUrl(qrVerificationUrl);

        const User = require("../models/User");
        const studentUser = await User.findById(studentId);
        const profile = await StudentProfile.findOne({ user: studentId });

        cert = await Certificate.create({
          certificateId: certId,
          student: studentId,
          event: eventId,
          achievementTitle: item.title || achievementTitle,
          position: item.position,
          issueDate: new Date(),
          signers,
          verificationHash: hash,
          qrCodeDataUrl,
          metadata: {
            studentName: studentUser ? studentUser.name : "JOY Student",
            rollNumber: profile ? profile.rollNumber : "N/A",
            department: profile ? profile.department : "N/A",
            eventTitle: event.title,
            eventCategory: event.category,
            eventDate: event.eventDate
          }
        });
      }

      // Notify student about result publication and certificate
      await createNotification({
        recipient: studentId,
        title: `Results Published: ${event.title}`,
        message: `Congratulations! Results have been announced for "${event.title}". You achieved: ${item.title || achievementTitle}. Your certificate is now ready!`,
        type: "result",
        link: `/student/results`
      });
    }

    res.json({
      success: true,
      message: "Event results published, achievements recorded, and certificates issued successfully.",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventResults,
  saveEventResults,
  publishEventResults
};
