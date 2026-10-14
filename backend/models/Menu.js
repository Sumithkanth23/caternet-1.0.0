// Menu packages created by caterers

const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String, // either default from foodItems.js or custom upload path under uploads/food
    },
    guestSlab: {
      type: String, // e.g. "100-300"
    },
    mealCategory: {
      type: String, // Breakfast / Lunch / Dinner
    },
    pricePerHead: {
      type: Number,
    },
  },
  { _id: false }
);

const menuSchema = new mongoose.Schema(
  {
    caterer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatererProfile",
      required: true,
    },
    packageName: {
      type: String,
      required: true,
      trim: true,
    },
    menuType: {
      type: String,
      enum: ["Veg", "Non-Veg", "Both"],
      required: true,
    },
    cuisineTypes: {
      type: [String],
      default: [],
    },
    menuImageUrl: {
      type: String, // uploads/menus path
    },
    items: {
      type: [foodItemSchema],
      default: [],
    },
    eventTypes: {
      type: [String],
      default: [],
    },
    availabilityDates: {
      type: [Date],
      default: [],
    },
    availableDays: {
      type: [String],
      default: [],
    },
    recommendedGuests: {
      type: Number,
    },
    description: {
      type: String,
      trim: true,
    },
    taxIncluded: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Published",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Menu", menuSchema);

