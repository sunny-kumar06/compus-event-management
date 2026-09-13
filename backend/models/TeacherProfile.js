const mongoose = require("mongoose");

const teacherProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
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
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true
    },
    officeRoom: {
      type: String,
      trim: true,
      default: ""
    },
    phone: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("TeacherProfile", teacherProfileSchema);
