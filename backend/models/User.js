const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "caterer", "employee", "admin"],
      default: "user",
    },
    passwordHash: {
      type: String,
      required: true,
    },
    phone: { type: String, default: "", trim: true },
    district: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    profileImageUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);

