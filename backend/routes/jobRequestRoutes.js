// /api/job-requests/*

const express = require("express");
const {
  createJobRequest,
  getJobRequestsForCaterer,
  getJobRequestsForEmployee,
  updateJobRequestStatus,
  updateJobRequestChecklist,
} = require("../controllers/jobRequestController");

const router = express.Router();

// Employee applies to a job
router.post("/", createJobRequest);

// All applications for jobs belonging to a caterer
router.get("/caterer/:id", getJobRequestsForCaterer);

// All applications submitted by an employee
router.get("/employee/:id", getJobRequestsForEmployee);

// Caterer updates status (Pending / Accepted / Declined)
router.put("/:id", updateJobRequestStatus);

// Employee dashboard checklist updates (complete / archive)
router.patch("/:id/checklist", updateJobRequestChecklist);

module.exports = router;

