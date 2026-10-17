// Employee applications for caterer job posts

const mongoose = require("mongoose");

const jobRequestSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeProfile",
      required: true,
    },
    experience: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
    },
    applicantEmail: {
      type: String,
      default: "",
    },
    applicantCity: {
      type: String,
      default: "",
    },
    languagesKnown: {
      type: [String],
      default: [],
    },
    previousExperience: {
      type: [
        {
          employerName: String,
          role: String,
          duration: String,
        },
      ],
      default: [],
    },
    skillsList: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Completed"],
      default: "Pending",
    },
    note: {
      type: String,
      trim: true,
    },
    // Denormalized snapshot – ensures applicant name/image are always available
    // even if the EmployeeProfile is later updated or deleted.
    applicantName: {
      type: String,
      trim: true,
    },
    applicantImageUrl: {
      type: String,
    },
    applicantRole: {
      type: String,
      trim: true,
    },
    applicantDistrict: {
      type: String,
      trim: true,
    },
    checklistCompleted: {
      type: Boolean,
      default: false,
    },
    checklistCompletedAt: {
      type: Date,
    },
    checklistArchived: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    autoCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobRequest", jobRequestSchema);

