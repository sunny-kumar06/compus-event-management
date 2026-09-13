const mongoose = require("mongoose");

const dynamicFormFieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "text",
        "textarea",
        "number",
        "email",
        "phone",
        "dropdown",
        "radio",
        "checkbox",
        "date",
        "file",
        "team_name",
        "team_members",
        "url"
      ]
    },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
    options: [{ type: String }],
    order: { type: Number, default: 0 }
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, "Event description is required"]
    },
    banner: {
      type: String,
      default: ""
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
      index: true
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"]
    },
    endTime: {
      type: String,
      required: [true, "End time is required"]
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true
    },
    regStartDate: {
      type: Date,
      default: Date.now
    },
    regDeadline: {
      type: Date,
      required: [true, "Registration deadline is required"],
      index: true
    },
    maxCapacity: {
      type: Number,
      default: 100,
      min: 1
    },
    currentRegistrationsCount: {
      type: Number,
      default: 0
    },
    eligibility: {
      type: String,
      default: "All JOY University Students"
    },
    rules: [{ type: String }],
    facultyCoordinators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
      }
    ],
    studentCoordinators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "registration_open",
        "registration_closed",
        "ongoing",
        "completed",
        "cancelled"
      ],
      default: "draft",
      index: true
    },
    dynamicFormSchema: [dynamicFormFieldSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Event", eventSchema);
