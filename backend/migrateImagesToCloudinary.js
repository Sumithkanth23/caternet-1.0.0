require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const { foodItems } = require("./data/foodItems");

const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

function validateEnvironmentVariables() {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    console.error(
      `❌ Missing Cloudinary environment variables: ${missingVars.join(", ")}`
    );
    process.exit(1);
  }
}

function toPublicId(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function buildFoodItemsFileContent(items) {
  const serializedItems = items
    .map((item) => {
      return [
        "  {",
        `    name: ${JSON.stringify(item.name)},`,
        `    category: ${JSON.stringify(item.category)},`,
        `    cuisine: ${JSON.stringify(item.cuisine)},`,
        `    imageUrl: ${JSON.stringify(item.imageUrl)},`,
        "  },",
      ].join("\n");
    })
    .join("\n");

  return [
    "// Food items used for auto-suggestions when caterer types dish names.",
    "// Keep this list small for now – you can extend it later.",
    "",
    "const foodItems = [",
    serializedItems,
    "];",
    "",
    "module.exports = { foodItems };",
    "",
  ].join("\n");
}

async function migrateImagesToCloudinary() {
  validateEnvironmentVariables();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log("🚀 Starting food image migration to Cloudinary...");
  console.log(`📦 Total items to process: ${foodItems.length}`);

  let successCount = 0;
  let failureCount = 0;

  for (let index = 0; index < foodItems.length; index += 1) {
    const item = foodItems[index];
    const publicId = toPublicId(item.name);

    console.log(
      `\n[${index + 1}/${foodItems.length}] Processing: ${item.name} (${item.imageUrl})`
    );

    try {
      const uploadResult = await cloudinary.uploader.upload(item.imageUrl, {
        folder: "caternet/food-defaults",
        public_id: publicId,
        overwrite: true,
      });

      item.imageUrl = uploadResult.secure_url;
      successCount += 1;

      console.log(`✅ Uploaded ${item.name} -> ${uploadResult.secure_url}`);
    } catch (error) {
      failureCount += 1;
      console.error(`❌ Failed to upload ${item.name}`);
      console.error(`   Reason: ${error.message}`);
    }
  }

  const foodItemsFilePath = path.join(__dirname, "data", "foodItems.js");
  const updatedFileContent = buildFoodItemsFileContent(foodItems);

  fs.writeFileSync(foodItemsFilePath, updatedFileContent, "utf8");

  console.log("\n📝 Updated data/foodItems.js with latest image URLs.");
  console.log(
    `🎉 Migration complete. Success: ${successCount}, Failed: ${failureCount}, Total: ${foodItems.length}`
  );
}

migrateImagesToCloudinary().catch((error) => {
  console.error("❌ Migration script failed unexpectedly.");
  console.error(error);
  process.exit(1);
});
