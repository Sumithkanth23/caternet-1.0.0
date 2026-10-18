// Caterer profile CRUD and dashboard statistics

const mongoose = require("mongoose");
const CatererProfile = require("../models/CatererProfile");
const Menu = require("../models/Menu");
const Booking = require("../models/Booking");
const JobPost = require("../models/JobPost");
const JobRequest = require("../models/JobRequest");

/**
 * POST /api/caterer/profile
 * Body (multipart/form-data):
 * - userId  (MongoDB ObjectId from login)
 * - serviceName, district, cuisineTypes (JSON/string[]), contactPhone, address, ownerName, yearsInBusiness, description
 * - serviceLogo (file) – uploaded to Cloudinary
 */
async function createProfile(req, res, next) {
  try {
    const {
      userId,
      serviceName,
      district,
      cuisineTypes,
      contactPhone,
      address,
      ownerName,
      yearsInBusiness,
      description,
    } = req.body;

    if (!userId || !serviceName || !district || !contactPhone) {
      return res.status(400).json({
        message: "userId, serviceName, district and contactPhone are required",
      });
    }

    let cuisines = [];
    if (Array.isArray(cuisineTypes)) cuisines = cuisineTypes;
    else if (typeof cuisineTypes === "string" && cuisineTypes.trim()) {
      try {
        cuisines = JSON.parse(cuisineTypes);
        if (!Array.isArray(cuisines)) cuisines = [cuisines];
      } catch {
        cuisines = cuisineTypes.split(",").map((c) => c.trim());
      }
    }

    const existing = await CatererProfile.findOne({ user: userId });
    if (existing) {
      existing.serviceName = serviceName;
      existing.district = district;
      existing.cuisineTypes = cuisines;
      existing.contactPhone = contactPhone;
      existing.address = address;
      existing.ownerName = ownerName;
      existing.yearsInBusiness = yearsInBusiness;
      existing.description = description;
      if (req.file?.path) {
        existing.logoUrl = req.file.path;
      }
      await existing.save();
      return res.status(200).json(existing);
    }

    const profile = await CatererProfile.create({
      user: userId,
      serviceName,
      district,
      cuisineTypes: cuisines,
      contactPhone,
      address,
      ownerName,
      yearsInBusiness,
      description,
      logoUrl: req.file ? req.file.path : undefined, // Cloudinary secure_url
    });

    return res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/caterer/profile/:id
 */
async function getProfileById(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await CatererProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/caterer/profile/by-user/:userId
 * Find profile by User ObjectId (used after login to check existing profile)
 */
async function getProfileByUserEmail(req, res, next) {
  try {
    const { email: userId } = req.params; // param name kept as 'email' in route for compat
    // Try ObjectId lookup first, fallback to legacy email string
    let profile = await CatererProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/caterer/profile/:id
 * Optional image replacement (serviceLogo file) – uploaded to Cloudinary
 */
async function updateProfile(req, res, next) {
  try {
    const { id } = req.params;
    const update = { ...req.body };

    if (update.cuisineTypes) {
      if (Array.isArray(update.cuisineTypes)) {
        // ok
      } else if (typeof update.cuisineTypes === "string") {
        try {
          const parsed = JSON.parse(update.cuisineTypes);
          update.cuisineTypes = Array.isArray(parsed)
            ? parsed
            : [parsed].filter(Boolean);
        } catch {
          update.cuisineTypes = update.cuisineTypes
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean);
        }
      }
    }

    if (req.file) {
      update.logoUrl = req.file.path; // Cloudinary secure_url
    }

    const profile = await CatererProfile.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/caterer/dashboard/:id
 * Real-time dashboard statistics for a caterer.
 * All counts and sums are calculated fresh from the DB on every request.
 *
 * @param {string} id  CatererProfile ObjectId
 */
async function getDashboard(req, res, next) {
  try {
    const { id } = req.params; // CatererProfile ObjectId

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    // Month boundaries (using local midnight boundaries stored in UTC for consistency)
    const startOfThisMonth = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), 1)
    );
    const startOfLastMonth = new Date(
      Date.UTC(now.getFullYear(), now.getMonth() - 1, 1)
    );
    // Last day of previous month (month=0 means day=0 rolls back to last day of prev month)
    const endOfLastMonth = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    );

    // ── Step 1: prepare casted ObjectId (aggregation $match requires ObjectId, not string)
    const catererObjId = new mongoose.Types.ObjectId(id);

    // ── Step 2: gather job-post IDs owned by this caterer (needed for employee request count)
    const catererJobIds = await JobPost.distinct("_id", { caterer: catererObjId });

    // ── Step 3: run all DB queries in parallel ──────────────────────────────
    const [
      totalMenus,
      totalBookings,
      pendingRequests,
      confirmedEvents,
      employeeRequests,
      recentBookingDocs,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
      payoutsPendingAgg,
      avgGuestsAgg,
      acceptedEventCandidates,
    ] = await Promise.all([
      // Total Published menus
      Menu.countDocuments({ caterer: catererObjId, status: "Published" }),

      // All bookings regardless of status
      Booking.countDocuments({ caterer: catererObjId }),

      // Bookings with status Pending
      Booking.countDocuments({ caterer: catererObjId, status: "Pending" }),

      // Bookings with status Accepted
      Booking.countDocuments({ caterer: catererObjId, status: "Accepted" }),

      // Employee (job) requests for this caterer with status Pending
      JobRequest.countDocuments({
        job: { $in: catererJobIds },
        status: "Pending",
      }),

      // Latest 5 bookings sorted by creation date (bookedOn) desc
      Booking.find({ caterer: catererObjId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .lean(),

      // Total revenue this month (Accepted, eventDate in current month)
      Booking.aggregate([
        {
          $match: {
            caterer: catererObjId,
            status: "Accepted",
            eventDate: { $gte: startOfThisMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // Revenue last month (Accepted, eventDate in previous month)
      Booking.aggregate([
        {
          $match: {
            caterer: catererObjId,
            status: "Accepted",
            eventDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // Payouts pending (Accepted bookings not yet paid out)
      Booking.aggregate([
        {
          $match: {
            caterer: catererObjId,
            status: "Accepted",
            payoutStatus: "Pending",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // Average guests per accepted event
      Booking.aggregate([
        {
          $match: {
            caterer: catererObjId,
            status: "Accepted",
          },
        },
        { $group: { _id: null, avg: { $avg: "$guestCount" } } },
      ]),

      // Accepted bookings candidates for upcoming checklist
      Booking.find({
        caterer: catererObjId,
        status: "Accepted",
        checklistArchived: { $ne: true },
      })
        .populate("menu", "eventTypes")
        .populate("caterer", "district")
        .populate("user", "name email")
        .lean(),
    ]);

    // ── Step 3: shape recent bookings for the frontend ────────────────────
    const recentBookings = recentBookingDocs.map((b) => ({
      id: b._id,
      // customerName is stored directly on the booking document at creation time
      clientName:
        b.customerName ||
        b.user?.name ||
        b.user?.email ||
        "Customer",
      guests: b.guestCount,
      eventDate: b.eventDate,
      bookedOn: b.createdAt,
      status: b.status, // "Pending" | "Accepted" | "Declined"
    }));

    // ── Step 4: extract aggregation results (default 0 when no docs match) ─
    const totalRevenueThisMonth = revenueThisMonthAgg[0]?.total ?? 0;
    const revenueLastMonth = revenueLastMonthAgg[0]?.total ?? 0;
    const payoutsPending = payoutsPendingAgg[0]?.total ?? 0;
    const averageGuestsPerEvent = avgGuestsAgg[0]?.avg
      ? Math.round(avgGuestsAgg[0].avg)
      : 0;

    const upcomingEvents = acceptedEventCandidates
      .map((booking) => {
        const rawEventDate = booking.eventDate;
        const parsedEventDate =
          rawEventDate instanceof Date ? rawEventDate : new Date(rawEventDate);

        if (Number.isNaN(parsedEventDate?.getTime?.())) {
          console.log("[Dashboard] Invalid eventDate format", {
            bookingId: booking._id,
            rawEventDate,
            rawType: typeof rawEventDate,
          });
          return null;
        }

        const isUpcoming = parsedEventDate >= startOfToday;

        console.log("[Dashboard] Accepted booking date check", {
          bookingId: booking._id,
          status: booking.status,
          rawEventDate,
          rawType: typeof rawEventDate,
          parsedEventDate: parsedEventDate.toISOString(),
          startOfToday: startOfToday.toISOString(),
          includedInUpcoming: isUpcoming,
        });

        return {
          id: booking._id,
          customerName:
            booking.customerName || booking.user?.name || booking.user?.email || "Customer",
          eventType: booking.menu?.eventTypes?.[0] || "Event",
          eventDate: parsedEventDate,
          guestCount: booking.guestCount,
          district: booking.caterer?.district || "—",
          customerPhone: booking.customerPhone || "—",
          checklistCompleted: Boolean(booking.checklistCompleted),
          checklistArchived: Boolean(booking.checklistArchived),
          isUpcoming,
        };
      })
      .filter((booking) => booking && booking.isUpcoming)
      .map(({ isUpcoming, ...booking }) => booking)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    console.log(
      `[Dashboard] caterer=${id} acceptedCandidates=${acceptedEventCandidates.length} upcomingEvents=${upcomingEvents.length} now=${now.toISOString()} startOfToday=${startOfToday.toISOString()}`
    );
    if (acceptedEventCandidates.length > 0 && upcomingEvents.length === 0) {
      console.log(
        "[Dashboard] Accepted bookings exist but none matched upcoming date filter. Verify booking eventDate values.",
        acceptedEventCandidates.map((b) => ({ id: b._id, eventDate: b.eventDate, status: b.status }))
      );
    }

    return res.json({
      dashboardStats: {
        totalMenus,
        totalBookings,
        pendingRequests,
        confirmedEvents,
        employeeRequests,
      },
      recentBookings,
      bookingSummary: {
        totalRevenueThisMonth,
        payoutsPending,
        revenueLastMonth,
        averageGuestsPerEvent,
      },
      upcomingEvents,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/caterer/public?district=&date=YYYY-MM-DD&limit=&sortBy=popular
 * Public listing of caterer companies for user UI cards.
 *
 * Query params:
 *  - district  : filter by district
 *  - date      : exclude caterers with an Accepted booking on that day (YYYY-MM-DD)
 *  - limit     : max results (default 9, max 50)
 *  - sortBy    : 'popular' → sort by rating desc then reviewCount desc
 *                default   → sort by createdAt desc
 */
async function getPublicCaterers(req, res, next) {
  try {
    const district = (req.query.district || "").toString().trim();
    const date = (req.query.date || "").toString().trim();
    const sortBy = (req.query.sortBy || "").toString().trim();
    const limit = Math.min(Number(req.query.limit) || 9, 50);

    const query = district ? { district } : {};

    // --- Availability filter ---
    if (date) {
      const dayStart = new Date(date);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const bookedCatererIds = await Booking.distinct("caterer", {
        eventDate: { $gte: dayStart, $lte: dayEnd },
        status: "Accepted",
      });

      if (bookedCatererIds.length > 0) {
        query._id = { $nin: bookedCatererIds };
      }
    }

    // --- Sort strategy ---
    // 'popular': highest-rated first (caterers without reviews sorted last)
    // default : newest profiles first
    const sort =
      sortBy === "popular"
        ? { rating: -1, reviewCount: -1, createdAt: -1 }
        : { createdAt: -1 };

    const caterers = await CatererProfile.find(query)
      .sort(sort)
      .limit(limit);

    res.json(caterers);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/caterer/history/bookings
 * Completed bookings for the authenticated caterer profile.
 */
async function getCatererBookingHistory(req, res, next) {
  try {
    const profile = await CatererProfile.findOne({ user: req.user.userId }).select("_id").lean();
    if (!profile) {
      return res.status(404).json({ message: "Caterer profile not found" });
    }

    const bookings = await Booking.find({
      caterer: profile._id,
      status: "Completed",
    })
      .populate("user", "name")
      .populate("menu", "packageName")
      .sort({ completedAt: -1 })
      .lean();

    return res.json(bookings);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/caterer/history/employees
 * Completed employee engagements for the authenticated caterer profile.
 */
async function getCatererEmployeeHistory(req, res, next) {
  try {
    const profile = await CatererProfile.findOne({ user: req.user.userId }).select("_id").lean();
    if (!profile) {
      return res.status(404).json({ message: "Caterer profile not found" });
    }

    const jobIds = await JobPost.distinct("_id", { caterer: profile._id });
    const requests = await JobRequest.find({
      job: { $in: jobIds },
      status: "Completed",
    })
      .populate("employee", "fullName role district")
      .populate("job", "title salaryAmount salaryPeriod workHoursFrom workHoursTo")
      .sort({ completedAt: -1 })
      .lean();

    return res.json(requests);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProfile,
  getProfileById,
  getProfileByUserEmail,
  updateProfile,
  getDashboard,
  getPublicCaterers,
  getCatererBookingHistory,
  getCatererEmployeeHistory,
};


