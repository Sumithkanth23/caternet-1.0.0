// Caterer profile schema: service details and contact info

const mongoose = require("mongoose");

const catererProfileSchema = new mongoose.Schema(
  {
    // user stores the MongoDB ObjectId from the User collection
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String, // relative path under uploads/services
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    cuisineTypes: {
      type: [String],
      default: [],
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    ownerName: {
      type: String,
      trim: true,
    },
    yearsInBusiness: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Computed average from the Reviews collection (synced on every review save)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CatererProfile", catererProfileSchema);

