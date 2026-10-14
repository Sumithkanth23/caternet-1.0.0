// Job post CRUD for caterers

const JobPost = require("../models/JobPost");

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
    const update = { ...req.body };

    if (update.startDate) update.startDate = new Date(update.startDate);
    if (update.endDate) update.endDate = new Date(update.endDate);
    if (update.salaryAmount) update.salaryAmount = Number(update.salaryAmount);
    if (update.skills) {
      update.skills = Array.isArray(update.skills)
        ? update.skills
        : update.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    const job = await JobPost.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
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
    const deleted = await JobPost.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ message: "Job deleted" });
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
};

