// Multer config with Cloudinary storage (service, menu, food, profile images)
// Handles image uploads for:
// - Caterer service logos        -> caternet/services
// - Menu cover images            -> caternet/menus
// - Custom food item images      -> caternet/food
// - User / employee profile pics -> caternet/profiles
// All images are stored on Cloudinary CDN with secure_url returned

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      // Organize uploads into subfolders based on fieldname
      if (file.fieldname === "serviceLogo") return "caternet/services";
      if (file.fieldname === "menuImage") return "caternet/menus";
      if (file.fieldname === "foodImages") return "caternet/food";
      if (file.fieldname === "profileImage") return "caternet/profiles";
      return "caternet"; // default folder
    },
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) => {
      // Generate unique filename using timestamp to prevent conflicts
      const timestamp = Date.now();
      const randomId = Math.round(Math.random() * 1e9);
      return `${timestamp}-${randomId}`;
    },
    resource_type: "auto",
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error("Only jpeg, jpg, png and webp images are allowed"));
  }
  cb(null, true);
};

const baseUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

const uploadServiceLogo = baseUpload.single("serviceLogo");
const uploadProfileImage = baseUpload.single("profileImage");

const uploadMenuWithFoodImages = baseUpload.fields([
  { name: "menuImage", maxCount: 1 },
  { name: "foodImages", maxCount: 30 },
]);

module.exports = {
  baseUpload,
  uploadServiceLogo,
  uploadProfileImage,
  uploadMenuWithFoodImages,
};
