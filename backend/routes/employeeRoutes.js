// /api/employee/*

const express = require("express");
const { createProfile, getProfileByUserId, getProfileById, updateProfile, getDashboard } = require("../controllers/employeeController");
const { uploadProfileImage } = require("../middleware/upload");

const router = express.Router();

router.post("/profile", uploadProfileImage, createProfile);
router.get("/profile/by-user/:userId", getProfileByUserId);
router.get("/profile/:id", getProfileById);
router.put("/profile/:id", uploadProfileImage, updateProfile);
router.get("/dashboard/:userId", getDashboard);

module.exports = router;

