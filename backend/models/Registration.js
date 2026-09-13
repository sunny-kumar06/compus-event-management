const mongoose = require("mongoose");
const { REGISTRATION_STATUS } = require("../config/constants");

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    customFormData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: Object.values(REGISTRATION_STATUS),
      default: REGISTRATION_STATUS.CONFIRMED,
      index: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate registrations for the same event by the same student
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
