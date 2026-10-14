// Employee profile schema – used for job applications

const mongoose = require("mongoose");

const employeeProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
    },
    district: {
      type: String,
    },
    availabilityDays: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    profileImageUrl: {
      type: String, // uploads/profiles path
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmployeeProfile", employeeProfileSchema);

