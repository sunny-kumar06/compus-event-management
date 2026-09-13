const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      trim: true,
      index: true
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      index: true
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
      index: true
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8
    },
    contactPhone: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true,
      default: ""
    },
    participationStats: {
      totalParticipated: { type: Number, default: 0 },
      firstPositions: { type: Number, default: 0 },
      secondPositions: { type: Number, default: 0 },
      thirdPositions: { type: Number, default: 0 },
      certificatesIssued: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
