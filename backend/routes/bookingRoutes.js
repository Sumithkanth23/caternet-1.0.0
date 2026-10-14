// /api/bookings/*

const express = require("express");
const {
  createBooking,
  getBookingsForCaterer,
  getBookingsForUser,
  updateBookingStatus,
  updateBookingChecklist,
} = require("../controllers/bookingController");

const router = express.Router();

// User creates a booking
router.post("/", createBooking);

// Caterer view of booking requests
router.get("/caterer/:id", getBookingsForCaterer);

// User \"My Bookings\" list
router.get("/user/:id", getBookingsForUser);

// Caterer updates booking status (accept / decline)
router.put("/:id", updateBookingStatus);

// Caterer dashboard checklist updates (complete / archive)
router.patch("/:id/checklist", updateBookingChecklist);

module.exports = router;

