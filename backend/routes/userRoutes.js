const express = require("express");
const { register, login, getMe, updateProfile } = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");
const { uploadProfileImage } = require("../middleware/upload");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.patch("/profile", verifyToken, uploadProfileImage, updateProfile);

module.exports = router;
