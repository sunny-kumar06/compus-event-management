const mongoose = require("mongoose");
const { ATTENDANCE_STATUS } = require("../config/constants");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSession"
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT,
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    markedMethod: {
      type: String,
      enum: ["qr_scan", "manual_teacher", "manual_admin"],
      default: "qr_scan"
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate attendance for the same event by the same student
attendanceSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
