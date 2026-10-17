const Booking = require("../models/Booking");
const JobPost = require("../models/JobPost");
const JobRequest = require("../models/JobRequest");

/**
 * Marks past accepted events and engagements as completed.
 * This function is intentionally schedule-agnostic so the server controls when it runs.
 */
async function runAutoComplete() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedAt = new Date();

  try {
    const bookingResult = await Booking.updateMany(
      {
        status: "Accepted",
        eventDate: { $lt: today },
        autoCompleted: { $ne: true },
      },
      {
        $set: {
          status: "Completed",
          completedAt,
          autoCompleted: true,
        },
      }
    );
    console.log(`[AutoComplete] Bookings completed: ${bookingResult.modifiedCount}`);

    const completedJobIds = await JobPost.distinct("_id", {
      startDate: { $lt: today },
    });
    const jobRequestResult = await JobRequest.updateMany(
      {
        job: { $in: completedJobIds },
        status: "Accepted",
        autoCompleted: { $ne: true },
      },
      {
        $set: {
          status: "Completed",
          completedAt,
          autoCompleted: true,
        },
      }
    );
    console.log(`[AutoComplete] Job requests completed: ${jobRequestResult.modifiedCount}`);
  } catch (err) {
    console.error("[AutoComplete] Failed to complete past events", err);
  }
}

module.exports = { runAutoComplete };
