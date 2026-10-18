// Job request (applications) – create and update status

const JobRequest = require("../models/JobRequest");
const JobPost = require("../models/JobPost");
const EmployeeProfile = require("../models/EmployeeProfile");
const CatererProfile = require("../models/CatererProfile");

/**
 * POST /api/job-requests
 * Body: jobId, employeeId, experience, skills[]
 */
async function createJobRequest(req, res, next) {
  try {
    const {
      jobId,
      employeeId,
      experience,
      skills,
      note,
      applicantEmail,
      applicantCity,
      languagesKnown,
      previousExperience,
      skillsList,
    } = req.body;

    const parseStringArray = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value !== "string" || !value.trim()) return [];
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
      }
    };
    const parseExperienceArray = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value !== "string" || !value.trim()) return [];
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    if (!jobId || !employeeId) {
      return res.status(400).json({ message: "jobId and employeeId are required" });
    }

    // Validate the employee profile exists before creating the request
    const employeeProfile = await EmployeeProfile.findById(employeeId).lean();
    if (!employeeProfile) {
      return res.status(404).json({
        message: "Employee profile not found. Please complete your profile before applying.",
      });
    }

    const existing = await JobRequest.findOne({
      job: jobId,
      employee: employeeId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job." });
    }

    const jr = await JobRequest.create({
      job: jobId,
      employee: employeeId,
      experience,
      note: note || '',
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim())
        : [],
      applicantEmail: applicantEmail || "",
      applicantCity: applicantCity || employeeProfile.district || "",
      languagesKnown: parseStringArray(languagesKnown),
      previousExperience: parseExperienceArray(previousExperience),
      skillsList: parseStringArray(skillsList),
      // Denormalized snapshot – always available even if the profile is later changed/deleted
      applicantName: employeeProfile.fullName || '',
      applicantImageUrl: employeeProfile.profileImageUrl || '',
      applicantRole: employeeProfile.role || '',
      applicantDistrict: employeeProfile.district || '',
    });

    res.status(201).json(jr);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/job-requests/caterer/:id
 * Returns all applications for jobs posted by this caterer.
 * Each entry merges live employee-profile data where available, falling back
 * to the denormalized snapshot stored at application time.
 */
async function getJobRequestsForCaterer(req, res, next) {
  try {
    const { id } = req.params; // catererProfileId

    const jobIds = await JobPost.find({ caterer: id }).distinct("_id");

    const requests = await JobRequest.find({ job: { $in: jobIds } })
      .populate({
        path: "job",
        select: "title location jobType startDate endDate positionsNeeded",
      })
      .populate({
        path: "employee",
        select: "fullName role skills experience district profileImageUrl phone",
      })
      .sort({ createdAt: -1 })
      .lean();

    // Normalise: if the live EmployeeProfile populate returned null (profile deleted /
    // ID mismatch), fall back to the denormalized snapshot fields so the caterer
    // always sees the applicant's basic information.
    const normalised = requests.map((r) => {
      const emp = r.employee; // populated doc or null
      return {
        ...r,
        applicantInfo: {
          fullName:        emp?.fullName        || r.applicantName     || "Unknown Applicant",
          role:            emp?.role            || r.applicantRole     || null,
          district:        emp?.district        || r.applicantDistrict || null,
          experience:      emp?.experience      || r.experience        || null,
          skills:          emp?.skills          || r.skills            || [],
          phone:           emp?.phone           || null,
          profileImageUrl: emp?.profileImageUrl || r.applicantImageUrl || null,
        },
      };
    });

    res.json(normalised);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/job-requests/employee/:id
 * For employee \"My Requests\" page – all applications by employee.
 */
async function getJobRequestsForEmployee(req, res, next) {
  try {
    const { id } = req.params; // employeeProfileId
    const requests = await JobRequest.find({ employee: id })
      .populate({
        path: "job",
        select: "title jobType startDate endDate",
        populate: { path: "caterer", select: "serviceName district logoUrl" },
      })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    next(err);
  }
}

/**
 * Finds the next free backup-bench position for a job, so manually waitlisted
 * applicants and the auto-cascade (below) never collide on the same number.
 */
async function getNextWaitlistPosition(jobId) {
  const highest = await JobRequest.findOne({ job: jobId, waitlistPosition: { $ne: null } })
    .sort({ waitlistPosition: -1 })
    .select("waitlistPosition")
    .lean();
  return (highest?.waitlistPosition || 0) + 1;
}

/**
 * PUT /api/job-requests/:id
 * Body: status (Pending/Accepted/Declined/Waitlisted)
 *
 * The caterer can directly put a pending applicant on the waitlist (a backup
 * offer) using the "Waitlist" button. A job can need more than one worker
 * (JobPost.positionsNeeded) — accepting an applicant only waitlists the
 * remaining pending applicants once every position has been filled, so the
 * caterer can accept 2 or 3 people for a job before the rest become
 * backups instead of being rejected outright.
 */
async function updateJobRequestStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Accepted", "Declined", "Waitlisted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const current = await JobRequest.findById(id);
    if (!current) {
      return res.status(404).json({ message: "Job request not found" });
    }

    if (status === "Waitlisted") {
      if (current.status !== "Pending") {
        return res.status(400).json({ message: "Only a pending applicant can be moved to the waitlist" });
      }
      current.status = "Waitlisted";
      current.waitlistPosition = await getNextWaitlistPosition(current.job);
      current.waitlistOfferedAt = new Date();
      await current.save();
    } else if (status === "Accepted") {
      if (current.status !== "Pending") {
        return res.status(400).json({ message: "Only a pending applicant can be accepted" });
      }

      const job = await JobPost.findById(current.job).select("positionsNeeded").lean();
      const positionsNeeded = job?.positionsNeeded || 1;
      const acceptedCount = await JobRequest.countDocuments({ job: current.job, status: "Accepted" });

      if (acceptedCount >= positionsNeeded) {
        return res.status(400).json({
          message: `All ${positionsNeeded} position${positionsNeeded !== 1 ? "s" : ""} for this job are already filled.`,
        });
      }

      current.status = "Accepted";
      await current.save();
    } else {
      current.status = status;
      await current.save();
    }

    let waitlistedCount = 0;
    if (status === "Accepted") {
      // Once every position is filled, everyone else still waiting on a
      // decision for this job becomes a backup offer, ranked by the order
      // they applied in. While seats are still open, leave the rest Pending
      // so the caterer can keep accepting more applicants.
      const job = await JobPost.findById(current.job).select("positionsNeeded").lean();
      const positionsNeeded = job?.positionsNeeded || 1;
      const acceptedCount = await JobRequest.countDocuments({ job: current.job, status: "Accepted" });

      if (acceptedCount >= positionsNeeded) {
        const others = await JobRequest.find({
          job: current.job,
          _id: { $ne: current._id },
          status: "Pending",
        }).sort({ createdAt: 1 });

        let nextPosition = await getNextWaitlistPosition(current.job);
        for (let i = 0; i < others.length; i += 1) {
          others[i].status = "Waitlisted";
          others[i].waitlistPosition = nextPosition;
          others[i].waitlistOfferedAt = new Date();
          await others[i].save();
          nextPosition += 1;
        }
        waitlistedCount = others.length;
      }
    }

    const jr = await JobRequest.findById(id)
      .populate({ path: "job", select: "title" })
      .populate({ path: "employee", select: "fullName role" });

    res.json({ ...jr.toObject(), waitlistedCount });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/job-requests/:id/waitlist-response
 * Body: { response: "accept" | "decline" }
 * The applicant responds to a backup offer. Requires the authenticated
 * employee to own the job request being responded to.
 */
async function respondToWaitlistOffer(req, res, next) {
  try {
    const { id } = req.params;
    const { response } = req.body || {};

    if (!["accept", "decline"].includes(response)) {
      return res.status(400).json({ message: "response must be 'accept' or 'decline'" });
    }

    const jr = await JobRequest.findById(id);
    if (!jr) {
      return res.status(404).json({ message: "Job request not found" });
    }

    const employeeProfile = await EmployeeProfile.findOne({ user: req.user.userId }).select("_id").lean();
    if (!employeeProfile || String(jr.employee) !== String(employeeProfile._id)) {
      return res.status(403).json({ message: "You can only respond to your own offers" });
    }

    if (jr.status !== "Waitlisted") {
      return res.status(400).json({ message: "This request is not an active waitlist offer" });
    }

    jr.status = response === "accept" ? "WaitlistAccepted" : "WaitlistDeclined";
    jr.waitlistRespondedAt = new Date();
    await jr.save();

    res.json(jr);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/job-requests/:id/no-show
 * Caterer marks the currently accepted worker as a no-show / cancellation,
 * freeing up the job so a backup can be promoted. Requires the authenticated
 * caterer to own the job.
 */
async function markNoShow(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const jr = await JobRequest.findById(id).populate("job");
    if (!jr) {
      return res.status(404).json({ message: "Job request not found" });
    }

    const catererProfile = await CatererProfile.findOne({ user: req.user.userId }).select("_id").lean();
    if (!catererProfile || String(jr.job?.caterer) !== String(catererProfile._id)) {
      return res.status(403).json({ message: "You don't have access to this job" });
    }

    if (jr.status !== "Accepted") {
      return res.status(400).json({ message: "Only the currently accepted worker can be marked as a no-show" });
    }

    jr.status = "No-Show";
    jr.noShowAt = new Date();
    if (reason) jr.noShowReason = reason;
    await jr.save();

    res.json(jr);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/job-requests/:id/promote
 * Caterer promotes a confirmed backup (WaitlistAccepted) to the active,
 * Accepted worker for the job — used after a no-show/cancellation. Requires
 * the authenticated caterer to own the job and that at least one of the
 * job's positions is still open (positionsNeeded > current accepted count).
 */
async function promoteFromWaitlist(req, res, next) {
  try {
    const { id } = req.params;

    const jr = await JobRequest.findById(id).populate("job");
    if (!jr) {
      return res.status(404).json({ message: "Job request not found" });
    }

    const catererProfile = await CatererProfile.findOne({ user: req.user.userId }).select("_id").lean();
    if (!catererProfile || String(jr.job?.caterer) !== String(catererProfile._id)) {
      return res.status(403).json({ message: "You don't have access to this job" });
    }

    if (jr.status !== "WaitlistAccepted") {
      return res.status(400).json({
        message: "Only a backup who has confirmed availability can be promoted",
      });
    }

    const positionsNeeded = jr.job?.positionsNeeded || 1;
    const acceptedCount = await JobRequest.countDocuments({
      job: jr.job._id,
      status: "Accepted",
      _id: { $ne: jr._id },
    });
    if (acceptedCount >= positionsNeeded) {
      return res.status(400).json({
        message: "All positions for this job are already filled. Mark someone as a no-show first.",
      });
    }

    jr.status = "Accepted";
    jr.promotedFromWaitlist = true;
    jr.promotedAt = new Date();
    await jr.save();

    res.json(jr);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/job-requests/:id/checklist
 * Body: { completed?: boolean, archived?: boolean }
 */
async function updateJobRequestChecklist(req, res, next) {
  try {
    const { id } = req.params;
    const { completed, archived } = req.body || {};

    if (typeof completed === "undefined" && typeof archived === "undefined") {
      return res.status(400).json({
        message: "At least one of completed or archived must be provided",
      });
    }

    const jr = await JobRequest.findById(id);
    if (!jr) {
      return res.status(404).json({ message: "Job request not found" });
    }

    if (jr.status !== "Accepted") {
      return res.status(400).json({
        message: "Checklist updates are allowed only for accepted job requests",
      });
    }

    if (typeof completed === "boolean") {
      jr.checklistCompleted = completed;
      jr.checklistCompletedAt = completed ? new Date() : null;
    }

    if (typeof archived === "boolean") {
      jr.checklistArchived = archived;
      if (archived) {
        jr.checklistCompleted = true;
        jr.checklistCompletedAt = jr.checklistCompletedAt || new Date();
      }
    }

    await jr.save();

    return res.json({
      _id: jr._id,
      checklistCompleted: jr.checklistCompleted,
      checklistCompletedAt: jr.checklistCompletedAt,
      checklistArchived: jr.checklistArchived,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/job-requests/employee/history
 * Completed jobs for the authenticated employee profile.
 */
async function getEmployeeJobHistory(req, res, next) {
  try {
    const employeeProfile = await EmployeeProfile.findOne({ user: req.user.userId })
      .select("_id")
      .lean();
    if (!employeeProfile) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const requests = await JobRequest.find({
      employee: employeeProfile._id,
      status: "Completed",
    })
      .populate({
        path: "job",
        select: "title location salaryAmount salaryPeriod startDate workHoursFrom workHoursTo caterer",
        populate: { path: "caterer", select: "serviceName" },
      })
      .sort({ completedAt: -1 })
      .lean();

    return res.json(requests);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createJobRequest,
  getJobRequestsForCaterer,
  getJobRequestsForEmployee,
  updateJobRequestStatus,
  respondToWaitlistOffer,
  markNoShow,
  promoteFromWaitlist,
  updateJobRequestChecklist,
  getEmployeeJobHistory,
};

