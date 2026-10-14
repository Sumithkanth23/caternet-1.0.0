// Review model – one review per accepted completed booking

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caterer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatererProfile",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // enforce one review per booking
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      trim: true,
      default: "",
    },
    reviewDate: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

// Index for fast caterer review lookups
reviewSchema.index({ caterer: 1 });

module.exports = mongoose.model("Review", reviewSchema);
