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
      enum: [
        "Pending",
        "Accepted",
        "Declined",
        "Waitlisted", // offered a backup spot after someone else was accepted
        "WaitlistAccepted", // employee agreed to be an on-call backup
        "WaitlistDeclined", // employee declined the backup offer
        "No-Show", // was Accepted, but didn't show up on event day
        "Completed",
      ],
      default: "Pending",
    },
    note: {
      type: String,
      trim: true,
    },
    // --- Waitlist / backup-bench tracking ---
    waitlistPosition: {
      // 1 = first backup in line, 2 = second, etc. Assigned when offered.
      type: Number,
      default: null,
    },
    waitlistOfferedAt: {
      type: Date,
      default: null,
    },
    waitlistRespondedAt: {
      type: Date,
      default: null,
    },
    promotedFromWaitlist: {
      type: Boolean,
      default: false,
    },
    promotedAt: {
      type: Date,
      default: null,
    },
    noShowAt: {
      type: Date,
      default: null,
    },
    noShowReason: {
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

