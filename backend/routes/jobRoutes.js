// /api/jobs/*

const express = require("express");
const {
  createJob,
  getAllJobs,
  getJobsByCaterer,
  getJobById,
  updateJob,
  deleteJob,
  closeJob,
} = require("../controllers/jobController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Create job post
router.post("/", createJob);

// All open jobs for employee job openings (must be before /:id)
router.get("/", getAllJobs);

// All jobs for a caterer
router.get("/caterer/:id", getJobsByCaterer);

// Single job
router.get("/:id", getJobById);
router.put("/:id", verifyToken, updateJob);
router.delete("/:id", verifyToken, deleteJob);
router.patch("/:id/close", verifyToken, closeJob);

module.exports = router;

