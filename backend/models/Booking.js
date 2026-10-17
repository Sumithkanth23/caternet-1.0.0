// User bookings for caterer menus

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
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
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventType: {
      type: String,
      enum: ["Wedding", "Birthday", "Engagement", "Corporate", "Temple Function", "Other"],
      default: "Other",
    },
    startTime: {
      type: String,
      default: "",
    },
    endTime: {
      type: String,
      default: "",
    },
    venueName: {
      type: String,
      default: "",
    },
    venueAddress: {
      type: String,
      default: "",
    },
    mapLocation: {
      type: String,
      default: "",
    },
    guestCount: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Completed"],
      default: "Pending",
    },
    declineReason: {
      type: String,
      trim: true,
    },
    payoutStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    checklistCompleted: {
      type: Boolean,
      default: false,
    },
    checklistCompletedAt: {
      type: Date,
    },
    checklistArchived: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    autoCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);

