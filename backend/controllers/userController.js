const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/auth");

function signToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * POST /api/user/register
 * Body: { name, email, password, role }
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validRoles = ["user", "caterer", "employee"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      passwordHash,
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/user/login
 * Body: { email, password, role }
 */
async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password and role are required" });
    }

    const validRoles = ["user", "caterer", "employee"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as '${user.role}'. Please select the correct role.`,
      });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/user/me  (protected)
 */
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, district: user.district, address: user.address, profileImageUrl: user.profileImageUrl });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const allowed = ["name", "phone", "district", "address"];
    const update = Object.fromEntries(allowed.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field)).map((field) => [field, req.body[field]]));
    if (req.file) update.profileImageUrl = req.file.path;
    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true, runValidators: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, district: user.district, address: user.address, profileImageUrl: user.profileImageUrl });
  } catch (err) { next(err); }
}

module.exports = { register, login, getMe, updateProfile };
