// Job posts created by caterers for workforce management

const mongoose = require("mongoose");

const jobPostSchema = new mongoose.Schema(
  {
    caterer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatererProfile",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["Full Time", "Part Time", "Contract", "One-time"],
      required: true,
    },
    // How many workers this posting needs filled (e.g. 3 cooks for one
    // event). Applicants are only auto-waitlisted once every slot is filled.
    positionsNeeded: {
      type: Number,
      default: 1,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    salaryAmount: {
      type: Number,
    },
    salaryPeriod: {
      type: String, // Per Month / Per Day / Per Event
    },
    minExperience: {
      type: String,
    },
    workHoursFrom: {
      type: String,
      default: "",
    },
    workHoursTo: {
      type: String,
      default: "",
    },
    supervisorName: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobPost", jobPostSchema);

