// /api/caterer/*

const express = require("express");
const {
  createProfile,
  getProfileById,
  getProfileByUserEmail,
  updateProfile,
  getDashboard,
  getPublicCaterers,
} = require("../controllers/catererController");
const { uploadServiceLogo } = require("../middleware/upload");

const router = express.Router();

// Create profile (with service logo upload)
router.post("/profile", uploadServiceLogo, createProfile);

// Get profile by user email (must be before /profile/:id)
router.get("/profile/by-user/:email", getProfileByUserEmail);

// Get profile by id
router.get("/profile/:id", getProfileById);

// Update profile (optional new logo)
router.put("/profile/:id", uploadServiceLogo, updateProfile);

// Dashboard stats
router.get("/dashboard/:id", getDashboard);

// Public listing for user UI
router.get("/public", getPublicCaterers);

module.exports = router;

