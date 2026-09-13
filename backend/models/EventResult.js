const mongoose = require("mongoose");
const { RESULT_POSITIONS } = require("../config/constants");

const winnerSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      enum: Object.values(RESULT_POSITIONS),
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration"
    },
    title: {
      type: String,
      default: "" // e.g. "Best Innovation", "1st Place Winner", "Top Debater"
    },
    teamName: {
      type: String,
      default: ""
    },
    remarks: {
      type: String,
      default: ""
    },
    score: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const eventResultSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true,
      index: true
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true
    },
    publishedAt: {
      type: Date
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    winners: [winnerSchema],
    generalRemarks: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("EventResult", eventResultSchema);
