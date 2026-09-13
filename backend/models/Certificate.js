const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true // e.g. JOY-CERT-2026-000123
    },
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
    achievementTitle: {
      type: String,
      required: true,
      default: "Certificate of Participation" // or "First Place - Winner", "Certificate of Merit"
    },
    position: {
      type: String,
      default: "participation"
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    signers: [
      {
        name: String,
        title: String,
        institution: String
      }
    ],
    qrCodeDataUrl: {
      type: String,
      default: ""
    },
    verificationHash: {
      type: String,
      required: true
    },
    metadata: {
      studentName: String,
      rollNumber: String,
      department: String,
      eventTitle: String,
      eventCategory: String,
      eventDate: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Certificate", certificateSchema);
