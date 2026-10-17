// Booking creation and status updates

const Booking = require("../models/Booking");
const User = require("../models/User");

/**
 * POST /api/bookings
 * Body: userEmail (or userId), catererId, menuId, eventDate, guestCount, customerName, customerPhone, totalAmount
 */
async function createBooking(req, res, next) {
  try {
    const {
      userId,
      userEmail,
      catererId,
      menuId,
      eventDate,
      eventType,
      startTime,
      endTime,
      venueName,
      venueAddress,
      mapLocation,
      guestCount,
      customerName,
      customerPhone,
      totalAmount,
    } = req.body;

    if ((!userId && !userEmail) || !catererId || !menuId || !eventDate || !guestCount || !customerName || !customerPhone) {
      return res.status(400).json({
        message: "userEmail (or userId), catererId, menuId, eventDate, guestCount, customerName and customerPhone are required",
      });
    }

    let userDoc;
    if (userId) {
      userDoc = await User.findById(userId);
      if (!userDoc) {
        return res.status(404).json({ message: "User not found" });
      }
    } else {
      // Find or create user by email
      userDoc = await User.findOne({ email: userEmail.toLowerCase().trim() });
      if (!userDoc) {
        userDoc = await User.create({
          email: userEmail.toLowerCase().trim(),
          role: "user",
        });
      }
    }

    const parsedEventDate = new Date(eventDate);

    console.log("[Booking:create] eventDate parse", {
      inputEventDate: eventDate,
      inputType: typeof eventDate,
      parsedEventDate: Number.isNaN(parsedEventDate.getTime())
        ? "Invalid Date"
        : parsedEventDate.toISOString(),
    });

    const booking = await Booking.create({
      user: userDoc._id,
      caterer: catererId,
      menu: menuId,
      eventDate: parsedEventDate,
      eventType,
      startTime,
      endTime,
      venueName,
      venueAddress,
      mapLocation,
      guestCount: Number(guestCount),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      totalAmount: totalAmount ? Number(totalAmount) : 0,
    });

    const populated = await Booking.findById(booking._id)
      .populate("user", "name email")
      .populate("caterer", "serviceName district")
      .populate("menu", "packageName");

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/caterer/:id
 * For caterer \"Booking Requests\" section.
 */
async function getBookingsForCaterer(req, res, next) {
  try {
    const { id } = req.params; // catererProfileId
    const bookings = await Booking.find({ caterer: id })
      .populate("user", "name email")
      .populate("menu", "packageName menuImageUrl")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/user/:email
 * For user \"My Bookings\" page. Uses email to find user.
 */
async function getBookingsForUser(req, res, next) {
  try {
    const { id: emailOrId } = req.params;
    let userDoc;
    
    // Try to find by email first, then by ID
    userDoc = await User.findOne({ email: emailOrId.toLowerCase().trim() });
    if (!userDoc) {
      userDoc = await User.findById(emailOrId);
    }
    
    if (!userDoc) {
      return res.json([]);
    }

    const bookings = await Booking.find({ user: userDoc._id })
      .populate({
        path: "caterer",
        select: "serviceName district logoUrl",
      })
      .populate("menu", "packageName menuImageUrl")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/bookings/:id
 * Body: status (Pending/Accepted/Declined), declineReason?
 */
async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, declineReason } = req.body;

    if (!["Pending", "Accepted", "Declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const update = { status };
    if (status === "Declined" && declineReason) {
      update.declineReason = declineReason;
    }

    const booking = await Booking.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email")
      .populate({
        path: "caterer",
        select: "serviceName district logoUrl",
      })
      .populate("menu", "packageName menuImageUrl");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/bookings/:id/checklist
 * Body: { completed?: boolean, archived?: boolean }
 */
async function updateBookingChecklist(req, res, next) {
  try {
    const { id } = req.params;
    const { completed, archived } = req.body || {};

    if (typeof completed === "undefined" && typeof archived === "undefined") {
      return res.status(400).json({
        message: "At least one of completed or archived must be provided",
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Accepted") {
      return res.status(400).json({
        message: "Checklist updates are allowed only for accepted bookings",
      });
    }

    if (typeof completed === "boolean") {
      booking.checklistCompleted = completed;
      booking.checklistCompletedAt = completed ? new Date() : null;
    }

    if (typeof archived === "boolean") {
      booking.checklistArchived = archived;
      if (archived) {
        booking.checklistCompleted = true;
        booking.checklistCompletedAt = booking.checklistCompletedAt || new Date();
      }
    }

    await booking.save();

    return res.json({
      _id: booking._id,
      checklistCompleted: booking.checklistCompleted,
      checklistCompletedAt: booking.checklistCompletedAt,
      checklistArchived: booking.checklistArchived,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/user/history
 * Completed bookings for the authenticated customer.
 */
async function getUserBookingHistory(req, res, next) {
  try {
    const bookings = await Booking.find({
      user: req.user.userId,
      status: "Completed",
    })
      .populate("caterer", "serviceName logoUrl")
      .populate("menu", "packageName")
      .sort({ completedAt: -1 })
      .lean();

    return res.json(bookings);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking,
  getBookingsForCaterer,
  getBookingsForUser,
  updateBookingStatus,
  updateBookingChecklist,
  getUserBookingHistory,
};

