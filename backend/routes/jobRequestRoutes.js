// /api/job-requests/*

const express = require("express");
const {
  createJobRequest,
  getJobRequestsForCaterer,
  getJobRequestsForEmployee,
  updateJobRequestStatus,
  respondToWaitlistOffer,
  markNoShow,
  promoteFromWaitlist,
  updateJobRequestChecklist,
  getEmployeeJobHistory,
} = require("../controllers/jobRequestController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Employee applies to a job
router.post("/", createJobRequest);

// All applications for jobs belonging to a caterer
router.get("/caterer/:id", getJobRequestsForCaterer);

// All applications submitted by an employee
router.get("/employee/history", verifyToken, getEmployeeJobHistory);
router.get("/employee/:id", getJobRequestsForEmployee);

// Caterer updates status (Pending / Accepted / Declined) — accepting one
// applicant automatically waitlists the other pending applicants.
router.put("/:id", updateJobRequestStatus);

// Employee accepts/declines a waitlist (backup) offer
router.put("/:id/waitlist-response", verifyToken, respondToWaitlistOffer);

// Caterer marks the accepted worker as a no-show/cancellation
router.put("/:id/no-show", verifyToken, markNoShow);

// Caterer promotes a confirmed backup to the active worker slot
router.put("/:id/promote", verifyToken, promoteFromWaitlist);

// Employee dashboard checklist updates (complete / archive)
router.patch("/:id/checklist", updateJobRequestChecklist);

module.exports = router;

