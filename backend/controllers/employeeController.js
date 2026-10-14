// Employee profile CRUD and dashboard stats

const EmployeeProfile = require("../models/EmployeeProfile");
const JobRequest = require("../models/JobRequest");
const JobPost = require("../models/JobPost");

/**
 * POST /api/employee/profile
 * Body (multipart/form-data): userId, fullName, role, skills (JSON array), experience,
 *   district, availabilityDays (JSON array), phone, summary, profileImage (file) – uploaded to Cloudinary
 */
async function createProfile(req, res, next) {
  try {
    const { userId, fullName, role, skills, experience, district, availabilityDays, phone, summary } = req.body;

    if (!userId || !fullName || !district || !phone) {
      return res.status(400).json({ message: "userId, fullName, district and phone are required" });
    }

    const existing = await EmployeeProfile.findOne({ user: userId });
    if (existing) {
      // Return existing so frontend can reuse it without creating a duplicate
      return res.status(200).json(existing);
    }

    const parseArr = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.trim()) {
        try { const p = JSON.parse(val); return Array.isArray(p) ? p : [p]; }
        catch { return val.split(",").map((s) => s.trim()).filter(Boolean); }
      }
      return [];
    };

    const profile = await EmployeeProfile.create({
      user: userId,
      fullName,
      role,
      skills: parseArr(skills),
      experience,
      district,
      availabilityDays: parseArr(availabilityDays),
      phone,
      summary,
      profileImageUrl: req.file ? req.file.path : undefined, // Cloudinary secure_url
    });

    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/employee/profile/by-user/:userId
 */
async function getProfileByUserId(req, res, next) {
  try {
    const { userId } = req.params;
    const profile = await EmployeeProfile.findOne({ user: userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/employee/profile/:id
 */
async function getProfileById(req, res, next) {
  try {
    const profile = await EmployeeProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/employee/profile/:id
 */
async function updateProfile(req, res, next) {
  try {
    const update = { ...req.body };
    const parseArr = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.trim()) {
        try { const p = JSON.parse(val); return Array.isArray(p) ? p : [p]; }
        catch { return val.split(",").map((s) => s.trim()).filter(Boolean); }
      }
      return undefined;
    };
    if (update.skills !== undefined) update.skills = parseArr(update.skills) || [];
    if (update.availabilityDays !== undefined) update.availabilityDays = parseArr(update.availabilityDays) || [];
    if (req.file) {
      update.profileImageUrl = req.file.path; // Cloudinary secure_url
    }
    const profile = await EmployeeProfile.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/employee/dashboard/:employeeProfileId
 * Real-time dashboard statistics and section data for an employee.
 * All counts are computed fresh on every request.
 *
 * @param {string} employeeProfileId  EmployeeProfile ObjectId
 */
async function getDashboard(req, res, next) {
  try {
    const { userId } = req.params; // kept as userId for route compat

    // Resolve employeeProfileId from the userId (User ObjectId)
    const profile = await EmployeeProfile.findOne({ user: userId }).lean();
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const employeeId = profile._id;
    const now = new Date();

    // ── Run all queries in parallel ────────────────────────────────────────
    const [
      jobsApplied,
      pendingCount,
      acceptedCount,
      upcomingWork,
      pendingRequests,
      upcomingEvents,
    ] = await Promise.all([
      // Total applications regardless of status
      JobRequest.countDocuments({ employee: employeeId }),

      // Applications awaiting caterer decision
      JobRequest.countDocuments({ employee: employeeId, status: "Pending" }),

      // Applications accepted by the caterer
      JobRequest.countDocuments({ employee: employeeId, status: "Accepted" }),

      // Accepted jobs whose event (startDate) is still in the future.
      // NOTE: .sort({ "job.startDate": 1 }) is intentionally NOT used here because
      // "job" is a ref (ObjectId) in the DB — MongoDB cannot sort by a populated
      // sub-document field. Sorting is done in-memory after populate + filter.
      JobRequest.find({ employee: employeeId, status: "Accepted" })
        .populate({
          path: "job",
          select: "title location startDate endDate jobType caterer salaryAmount salaryPeriod",
          populate: { path: "caterer", select: "serviceName district logoUrl" },
        })
        .lean()
        .then((docs) =>
          docs
            .filter((r) => r.job && r.job.startDate && new Date(r.job.startDate) > now)
            .sort((a, b) => new Date(a.job.startDate) - new Date(b.job.startDate))
        ),

      // Latest pending requests with full job + caterer detail
      JobRequest.find({ employee: employeeId, status: "Pending" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: "job",
          select: "title location startDate endDate jobType caterer",
          populate: { path: "caterer", select: "serviceName district logoUrl" },
        })
        .lean(),

      // Accepted job requests with upcoming event date (startDate), non-archived checklist
      JobRequest.find({
        employee: employeeId,
        status: "Accepted",
        checklistArchived: { $ne: true },
      })
        .populate({
          path: "job",
          select: "title location startDate endDate jobType caterer",
          populate: { path: "caterer", select: "serviceName district contactPhone" },
        })
        .lean()
        .then((docs) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          return docs
            .map((r) => {
              const parsedEventDate =
                r?.job?.startDate instanceof Date
                  ? r.job.startDate
                  : new Date(r?.job?.startDate);

              if (!r.job || Number.isNaN(parsedEventDate?.getTime?.())) {
                return null;
              }

              return {
                id: r._id,
                jobTitle: r.job.title || "Event",
                eventType: r.job.jobType || "Event",
                eventDate: parsedEventDate,
                district: r.job.location || r.job.caterer?.district || "—",
                catererName: r.job.caterer?.serviceName || "—",
                catererPhone: r.job.caterer?.contactPhone || "—",
                checklistCompleted: Boolean(r.checklistCompleted),
                checklistArchived: Boolean(r.checklistArchived),
              };
            })
            .filter((item) => item && item.eventDate >= today)
            .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        }),
    ]);

    // ── Shape upcoming work ────────────────────────────────────────────────
    const upcomingWorkShaped = upcomingWork.slice(0, 5).map((r) => ({
      id: r._id,
      jobTitle:      r.job?.title                   || "—",
      location:      r.job?.location                || r.job?.caterer?.district || "—",
      eventDate:     r.job?.startDate               || null,
      endDate:       r.job?.endDate                 || null,
      jobType:       r.job?.jobType                 || null,
      salaryAmount:  r.job?.salaryAmount            || null,
      salaryPeriod:  r.job?.salaryPeriod            || null,
      catererName:   r.job?.caterer?.serviceName    || "—",
      catererLogo:   r.job?.caterer?.logoUrl        || null,
      catererDistrict: r.job?.caterer?.district     || null,
      jobId:         r.job?._id                     || null,
    }));

    // ── Shape pending requests ─────────────────────────────────────────────
    const pendingRequestsShaped = pendingRequests.map((r) => ({
      id:           r._id,
      jobTitle:     r.job?.title                   || "—",
      location:     r.job?.location                || "—",
      eventDate:    r.job?.startDate               || null,
      jobType:      r.job?.jobType                 || null,
      catererName:  r.job?.caterer?.serviceName    || "—",
      catererLogo:  r.job?.caterer?.logoUrl        || null,
      appliedOn:    r.createdAt,
      note:         r.note                         || null,
    }));

    return res.json({
      dashboardStats: {
        jobsApplied,
        pendingRequests: pendingCount,
        acceptedJob:     acceptedCount,
        upcomingWork:    upcomingWork.length,
      },
      upcomingWork:    upcomingWorkShaped,
      pendingRequests: pendingRequestsShaped,
      upcomingEvents,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createProfile, getProfileByUserId, getProfileById, updateProfile, getDashboard };
