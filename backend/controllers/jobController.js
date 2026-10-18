// Job post CRUD for caterers

const JobPost = require("../models/JobPost");
const JobRequest = require("../models/JobRequest");
const CatererProfile = require("../models/CatererProfile");

/**
 * POST /api/jobs
 */
async function createJob(req, res, next) {
  try {
    const {
      catererId,
      title,
      description,
      location,
      jobType,
      startDate,
      endDate,
      salaryAmount,
      salaryPeriod,
      minExperience,
      skills,
      workHoursFrom,
      workHoursTo,
      supervisorName,
      positionsNeeded,
    } = req.body;

    if (!catererId || !title || !jobType || !startDate) {
      return res
        .status(400)
        .json({ message: "catererId, title, jobType and startDate are required" });
    }

    const job = await JobPost.create({
      caterer: catererId,
      title,
      description,
      location,
      jobType,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      salaryAmount: salaryAmount ? Number(salaryAmount) : undefined,
      salaryPeriod,
      minExperience,
      workHoursFrom,
      workHoursTo,
      supervisorName,
      positionsNeeded: positionsNeeded ? Math.max(1, Number(positionsNeeded)) : 1,
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim())
        : [],
    });

    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/jobs/caterer/:id
 */
async function getJobsByCaterer(req, res, next) {
  try {
    const { id } = req.params;
    const jobs = await JobPost.find({ caterer: id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/jobs/:id
 */
async function getJobById(req, res, next) {
  try {
    const { id } = req.params;
    const job = await JobPost.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/jobs/:id
 */
async function updateJob(req, res, next) {
  try {
    const { id } = req.params;
    const job = await JobPost.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const profile = await CatererProfile.findOne({ user: req.user.userId }).select("_id").lean();
    if (!profile || job.caterer.toString() !== profile._id.toString()) {
      return res.status(403).json({ message: "You do not own this job" });
    }

    const allowedFields = [
      "title",
      "description",
      "location",
      "jobType",
      "startDate",
      "endDate",
      "salaryAmount",
      "salaryPeriod",
      "minExperience",
      "requiredSkills",
      "workHoursFrom",
      "workHoursTo",
      "supervisorName",
      "positionsNeeded",
    ];
    const update = Object.fromEntries(
      allowedFields
        .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]])
    );

    if (update.startDate !== undefined) update.startDate = new Date(update.startDate);
    if (update.endDate !== undefined) update.endDate = update.endDate ? new Date(update.endDate) : undefined;
    if (update.salaryAmount !== undefined) update.salaryAmount = Number(update.salaryAmount);
    if (update.positionsNeeded !== undefined) update.positionsNeeded = Math.max(1, Number(update.positionsNeeded) || 1);
    if (update.requiredSkills !== undefined) {
      update.skills = Array.isArray(update.requiredSkills)
        ? update.requiredSkills
        : typeof update.requiredSkills === "string"
        ? update.requiredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      delete update.requiredSkills;
    }

    const updatedJob = await JobPost.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    res.json(updatedJob);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/jobs/:id
 */
async function deleteJob(req, res, next) {
  try {
    const { id } = req.params;
    const job = await JobPost.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const profile = await CatererProfile.findOne({ user: req.user.userId }).select("_id").lean();
    if (!profile || job.caterer.toString() !== profile._id.toString()) {
      return res.status(403).json({ message: "You do not own this job" });
    }

    const hasAcceptedRequests = await JobRequest.exists({ job: job._id, status: "Accepted" });
    if (hasAcceptedRequests) {
      return res.status(400).json({
        message: "Jobs with accepted applications cannot be deleted",
      });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/jobs/:id/close
 */
async function closeJob(req, res, next) {
  try {
    const job = await JobPost.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const profile = await CatererProfile.findOne({ user: req.user.userId }).select("_id").lean();
    if (!profile || job.caterer.toString() !== profile._id.toString()) {
      return res.status(403).json({ message: "You do not own this job" });
    }

    job.status = "Closed";
    await job.save();
    return res.json(job);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/jobs
 * All open jobs for employee job openings page.
 * Populates caterer name and district.
 */
async function getAllJobs(req, res, next) {
  try {
    const { district, search } = req.query;
    const query = { status: "Open" };
    if (district && district !== "All Districts") query.location = district;

    const jobs = await JobPost.find(query)
      .populate("caterer", "serviceName district logoUrl")
      .sort({ createdAt: -1 });

    const filtered = search
      ? jobs.filter(
          (j) =>
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            (j.description || "").toLowerCase().includes(search.toLowerCase()) ||
            (j.caterer?.serviceName || "").toLowerCase().includes(search.toLowerCase())
        )
      : jobs;

    res.json(filtered);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createJob,
  getAllJobs,
  getJobsByCaterer,
  getJobById,
  updateJob,
  deleteJob,
  closeJob,
};

