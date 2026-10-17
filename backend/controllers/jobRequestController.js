// Job request (applications) – create and update status

const JobRequest = require("../models/JobRequest");
const JobPost = require("../models/JobPost");
const EmployeeProfile = require("../models/EmployeeProfile");

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
        select: "title location jobType startDate endDate",
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
 * PUT /api/job-requests/:id
 * Body: status (Pending/Accepted/Declined)
 */
async function updateJobRequestStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Accepted", "Declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const jr = await JobRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate({
        path: "job",
        select: "title",
      })
      .populate({
        path: "employee",
        select: "fullName role",
      });

    if (!jr) {
      return res.status(404).json({ message: "Job request not found" });
    }

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
  updateJobRequestChecklist,
  getEmployeeJobHistory,
};

