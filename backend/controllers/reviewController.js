// Review CRUD – one review per accepted, completed booking

const Review = require("../models/Review");
const Booking = require("../models/Booking");
const CatererProfile = require("../models/CatererProfile");

/**
 * Recompute the mean rating for a caterer from all their reviews
 * and persist it on the CatererProfile document.
 */
async function syncCatererRating(catererId) {
  const result = await Review.aggregate([
    { $match: { caterer: catererId } },
    { $group: { _id: "$caterer", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = result.length > 0 ? Math.round(result[0].avg * 10) / 10 : 0;
  const count = result.length > 0 ? result[0].count : 0;
  await CatererProfile.findByIdAndUpdate(catererId, {
    rating: avg,
    reviewCount: count,
  });
  return { avg, count };
}

/**
 * POST /api/reviews
 * Body: { bookingId, rating (1-5), reviewText }
 * Guards:
 *  - booking must exist and belong to the authenticated user
 *  - booking status must be "Accepted"
 *  - booking eventDate must be in the past
 *  - no review may already exist for this booking
 */
async function createReview(req, res, next) {
  try {
    const { bookingId, rating, reviewText } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: "bookingId and rating are required" });
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "rating must be an integer between 1 and 5" });
    }

    // Load the booking with caterer info
    const booking = await Booking.findById(bookingId).populate("caterer", "_id");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Accepted") {
      return res.status(400).json({ message: "Reviews can only be left for accepted bookings" });
    }

    const now = new Date();
    const eventDay = new Date(booking.eventDate);
    eventDay.setHours(23, 59, 59, 999); // end of event day
    if (eventDay >= now) {
      return res.status(400).json({ message: "Reviews can only be left after the event date has passed" });
    }

    // Idempotency: reject if review already submitted for this booking
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(409).json({ message: "A review for this booking already exists" });
    }

    const review = await Review.create({
      user: booking.user,
      caterer: booking.caterer._id,
      booking: bookingId,
      rating: ratingNum,
      reviewText: (reviewText || "").trim(),
      reviewDate: new Date(),
    });

    // Keep caterer's aggregate rating fresh
    await syncCatererRating(booking.caterer._id);

    // Return review populated with user name for immediate UI display
    const populated = await Review.findById(review._id).populate("user", "name email");
    return res.status(201).json(populated);
  } catch (err) {
    // Duplicate key on unique booking index
    if (err.code === 11000) {
      return res.status(409).json({ message: "A review for this booking already exists" });
    }
    next(err);
  }
}

/**
 * GET /api/reviews/caterer/:catererId
 * Returns all reviews for the given caterer, sorted newest first.
 */
async function getReviewsByCaterer(req, res, next) {
  try {
    const { catererId } = req.params;
    const reviews = await Review.find({ caterer: catererId })
      .populate("user", "name email")
      .sort({ reviewDate: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reviews/booking/:bookingId
 * Returns the review for a specific booking, or 404 if none.
 * Used by MyBookings to know which bookings already have a review.
 */
async function getReviewByBooking(req, res, next) {
  try {
    const { bookingId } = req.params;
    const review = await Review.findOne({ booking: bookingId });
    if (!review) return res.status(404).json({ message: "No review found for this booking" });
    res.json(review);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reviews/user/:userId
 * Returns all reviews submitted by a user (keyed by bookingId for O(1) lookup).
 */
async function getReviewsByUser(req, res, next) {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ user: userId });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReview,
  getReviewsByCaterer,
  getReviewByBooking,
  getReviewsByUser,
};
