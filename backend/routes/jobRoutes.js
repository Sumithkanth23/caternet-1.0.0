// /api/jobs/*

const express = require("express");
const {
  createJob,
  getAllJobs,
  getJobsByCaterer,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

const router = express.Router();

// Create job post
router.post("/", createJob);

// All open jobs for employee job openings (must be before /:id)
router.get("/", getAllJobs);

// All jobs for a caterer
router.get("/caterer/:id", getJobsByCaterer);

// Single job
router.get("/:id", getJobById);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

module.exports = router;

