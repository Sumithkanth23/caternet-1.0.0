require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { runAutoComplete } = require("./jobs/autoComplete");

const catererRoutes = require("./routes/catererRoutes");
const menuRoutes = require("./routes/menuRoutes");
const jobRoutes = require("./routes/jobRoutes");
const jobRequestRoutes = require("./routes/jobRequestRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

connectDB()
  .then(() => {
    // Run after the database connection is ready, then once every 24 hours.
    runAutoComplete();
    setInterval(runAutoComplete, 24 * 60 * 60 * 1000);
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Legacy support: Serve old local uploads for existing profiles
// New uploads go to Cloudinary, but we keep this for backward compatibility
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/caterer", catererRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/job-requests", jobRequestRoutes);
app.use("/api/bookings", bookingRoutes);

// Placeholders for user / employee – to be implemented later
app.use("/api/user", userRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "CaterNet backend running" });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

