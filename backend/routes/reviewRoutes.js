// /api/reviews/*

const express = require("express");
const {
  createReview,
  getReviewsByCaterer,
  getReviewByBooking,
  getReviewsByUser,
} = require("../controllers/reviewController");

const router = express.Router();

// Submit a new review
router.post("/", createReview);

// All reviews for a caterer (used on ServiceDetailsPage)
router.get("/caterer/:catererId", getReviewsByCaterer);

// Check if a booking already has a review
router.get("/booking/:bookingId", getReviewByBooking);

// All reviews by a user (used on MyBookings)
router.get("/user/:userId", getReviewsByUser);

module.exports = router;
