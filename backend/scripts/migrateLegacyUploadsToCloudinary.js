require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const CatererProfile = require("../models/CatererProfile");
const EmployeeProfile = require("../models/EmployeeProfile");
const Menu = require("../models/Menu");

function isLegacyUploadUrl(value) {
  return typeof value === "string" && value.startsWith("/uploads/");
}

function resolveLocalFile(relativeUploadPath) {
  const relativePath = relativeUploadPath.replace(/^\/uploads\//, "");
  return path.join(__dirname, "..", "uploads", ...relativePath.split("/"));
}

function getCloudinaryFolder(relativeUploadPath) {
  if (relativeUploadPath.startsWith("/uploads/services/")) return "caternet/services";
  if (relativeUploadPath.startsWith("/uploads/menus/")) return "caternet/menus";
  if (relativeUploadPath.startsWith("/uploads/food/")) return "caternet/food";
  if (relativeUploadPath.startsWith("/uploads/profiles/")) return "caternet/profiles";
  return "caternet";
}

async function uploadLegacyFile(relativeUploadPath) {
  const localFile = resolveLocalFile(relativeUploadPath);
  if (!fs.existsSync(localFile)) {
    throw new Error(`Local file not found: ${localFile}`);
  }

  const folder = getCloudinaryFolder(relativeUploadPath);
  const uploaded = await cloudinary.uploader.upload(localFile, {
    folder,
    resource_type: "image",
    use_filename: true,
    unique_filename: true,
  });

  return uploaded.secure_url;
}

async function migrateCatererProfiles() {
  const profiles = await CatererProfile.find({
    logoUrl: { $regex: "^/uploads/" },
  });

  let migrated = 0;
  for (const profile of profiles) {
    profile.logoUrl = await uploadLegacyFile(profile.logoUrl);
    await profile.save();
    migrated += 1;
    console.log(`Migrated caterer profile: ${profile.serviceName}`);
  }

  return migrated;
}

async function migrateEmployeeProfiles() {
  const profiles = await EmployeeProfile.find({
    profileImageUrl: { $regex: "^/uploads/" },
  });

  let migrated = 0;
  for (const profile of profiles) {
    profile.profileImageUrl = await uploadLegacyFile(profile.profileImageUrl);
    await profile.save();
    migrated += 1;
    console.log(`Migrated employee profile: ${profile.fullName}`);
  }

  return migrated;
}

async function migrateMenus() {
  const menus = await Menu.find({
    $or: [
      { menuImageUrl: { $regex: "^/uploads/" } },
      { "items.imageUrl": { $regex: "^/uploads/" } },
    ],
  });

  let migrated = 0;
  for (const menu of menus) {
    let changed = false;

    if (isLegacyUploadUrl(menu.menuImageUrl)) {
      menu.menuImageUrl = await uploadLegacyFile(menu.menuImageUrl);
      changed = true;
    }

    menu.items = await Promise.all(
      menu.items.map(async (item) => {
        if (isLegacyUploadUrl(item.imageUrl)) {
          item.imageUrl = await uploadLegacyFile(item.imageUrl);
          changed = true;
        }
        return item;
      })
    );

    if (changed) {
      await menu.save();
      migrated += 1;
      console.log(`Migrated menu: ${menu.packageName}`);
    }
  }

  return migrated;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const caterers = await migrateCatererProfiles();
  const employees = await migrateEmployeeProfiles();
  const menus = await migrateMenus();

  console.log(`Migration complete. Caterers: ${caterers}, Employees: ${employees}, Menus: ${menus}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors on failure path
  }
  process.exit(1);
});
