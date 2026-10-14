// Menu CRUD and food auto-suggestions

const Menu = require("../models/Menu");
const { foodItems } = require("../data/foodItems");
const cloudinary = require("../config/cloudinary");
const suggestionImageCache = new Map();
let foodItemsSyncPromise = null;

function parseArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through
    }
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function normaliseUploadPath(file) {
  if (!file) return undefined;
  return file.path || file.secure_url || undefined;
}

function isCloudinaryUrl(url) {
  if (!url) return false;
  return /(^|\.)cloudinary\.com/i.test(String(url));
}

function isHttpUrl(url) {
  if (!url) return false;
  return /^https?:\/\//i.test(String(url));
}

function safePublicIdPart(value) {
  return String(value || "food")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "food";
}

async function uploadSuggestionImageToCloudinary(imageUrl, itemName, cache) {
  if (!isHttpUrl(imageUrl) || isCloudinaryUrl(imageUrl)) return imageUrl;

  if (cache.has(imageUrl)) {
    return cache.get(imageUrl);
  }

  const publicId = `${Date.now()}-${safePublicIdPart(itemName)}`;
  let uploaded;

  try {
    uploaded = await cloudinary.uploader.upload(imageUrl, {
      folder: "caternet/food",
      resource_type: "image",
      public_id: publicId,
    });
  } catch {
    // Fallback: fetch remote image and upload as data URI (handles hotlink-blocked URLs)
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch suggestion image: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arr = await response.arrayBuffer();
    const base64 = Buffer.from(arr).toString("base64");
    const dataUri = `data:${contentType};base64,${base64}`;

    uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: "caternet/food",
      resource_type: "image",
      public_id: publicId,
    });
  }

  const secureUrl = uploaded?.secure_url || uploaded?.url || imageUrl;
  cache.set(imageUrl, secureUrl);
  return secureUrl;
}

async function ensureFoodItemsCloudinarySynced() {
  if (foodItemsSyncPromise) {
    await foodItemsSyncPromise;
    return;
  }

  foodItemsSyncPromise = (async () => {
    await Promise.all(
      foodItems.map(async (item) => {
        if (!item?.imageUrl || isCloudinaryUrl(item.imageUrl)) return;
        try {
          const cloudImage = await uploadSuggestionImageToCloudinary(
            item.imageUrl,
            item.name,
            suggestionImageCache
          );
          item.imageUrl = cloudImage;
        } catch {
          // Keep original URL for this item if upload fails
        }
      })
    );
  })();

  await foodItemsSyncPromise;
}

/**
 * POST /api/menu
 * Multipart form:
 *  - catererId
 *  - packageName, menuType, cuisineTypes, eventTypes, availabilityDates, availableDays,
 *    recommendedGuests, description, taxIncluded
 *  - items: JSON string [{ name, imageUrl?, guestSlab, mealCategory, pricePerHead, customImageIndex? }]
 *  - menuImage (file) – uploaded to Cloudinary
 *  - foodImages (files[]) – optional custom images, matched by customImageIndex in items array, uploaded to Cloudinary
 */
async function createMenu(req, res, next) {
  try {
    const {
      catererId,
      packageName,
      menuType,
      cuisineTypes,
      eventTypes,
      availabilityDates,
      availableDays,
      recommendedGuests,
      description,
      taxIncluded,
      items,
    } = req.body;

    if (!catererId || !packageName || !menuType) {
      return res
        .status(400)
        .json({ message: "catererId, packageName and menuType are required" });
    }

    let parsedItems = [];
    if (items) {
      try {
        parsedItems = JSON.parse(items);
        if (!Array.isArray(parsedItems)) parsedItems = [];
      } catch {
        parsedItems = [];
      }
    }

    const foodImages = req.files?.foodImages || [];
    const suggestionUploadCache = new Map();

    const itemsWithImages = await Promise.all(parsedItems.map(async (item) => {
      let imageUrl = item.imageUrl;

      if (item.customImageIndex != null) {
        const idx = Number(item.customImageIndex);
        const file = foodImages[idx];
        if (file) {
          imageUrl = normaliseUploadPath(file); // Cloudinary secure_url
        }
      } else if (imageUrl) {
        imageUrl = await uploadSuggestionImageToCloudinary(
          imageUrl,
          item.name,
          suggestionUploadCache
        );
      }

      return {
        name: item.name,
        imageUrl,
        guestSlab: item.guestSlab,
        mealCategory: item.mealCategory,
        pricePerHead: item.pricePerHead,
      };
    }));

    const availabilityDateValues = parseArrayField(availabilityDates).map(
      (d) => new Date(d)
    );

    const menu = await Menu.create({
      caterer: catererId,
      packageName,
      menuType,
      cuisineTypes: parseArrayField(cuisineTypes),
      menuImageUrl: req.files?.menuImage
        ? req.files.menuImage[0].path // Cloudinary secure_url
        : undefined,
      items: itemsWithImages,
      eventTypes: parseArrayField(eventTypes),
      availabilityDates: availabilityDateValues,
      availableDays: parseArrayField(availableDays),
      recommendedGuests: recommendedGuests ? Number(recommendedGuests) : undefined,
      description,
      taxIncluded: taxIncluded === "true" || taxIncluded === true,
    });

    // Populate caterer info before returning
    const populated = await Menu.findById(menu._id).populate("caterer");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/menu/caterer/:catererId
 */
async function getMenusByCaterer(req, res, next) {
  try {
    const { catererId } = req.params;
    const menus = await Menu.find({ caterer: catererId }).sort({ createdAt: -1 });
    res.json(menus);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/menu/:id
 */
async function getMenuById(req, res, next) {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id).populate("caterer");
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.json(menu);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/menu/public?district=&limit=
 * Public listing used by user UI.
 */
async function getPublicMenus(req, res, next) {
  try {
    const district = (req.query.district || "").toString().trim();
    const limit = Math.min(Number(req.query.limit) || 9, 30);

    const query = Menu.find().sort({ createdAt: -1 }).limit(limit).populate("caterer");
    const menus = await query;

    const filtered = district
      ? menus.filter((m) => m.caterer && m.caterer.district === district)
      : menus;

    res.json(filtered);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/menu/:id
 * Multipart form: same as create, supports replacing menu image and food images.
 */
async function updateMenu(req, res, next) {
  try {
    const { id } = req.params;
    const update = { ...req.body };

    if (update.cuisineTypes) {
      update.cuisineTypes = parseArrayField(update.cuisineTypes);
    }
    if (update.eventTypes) {
      update.eventTypes = parseArrayField(update.eventTypes);
    }
    if (update.availableDays) {
      update.availableDays = parseArrayField(update.availableDays);
    }
    if (update.availabilityDates) {
      update.availabilityDates = parseArrayField(update.availabilityDates).map(
        (d) => new Date(d)
      );
    }
    if (update.recommendedGuests) {
      update.recommendedGuests = Number(update.recommendedGuests);
    }
    if (typeof update.taxIncluded !== "undefined") {
      update.taxIncluded =
        update.taxIncluded === "true" || update.taxIncluded === true;
    }

    if (req.files?.menuImage && req.files.menuImage[0]) {
      update.menuImageUrl = normaliseUploadPath(req.files.menuImage[0]);
    }

    if (update.items) {
      try {
        const parsedItems = JSON.parse(update.items);
        if (Array.isArray(parsedItems)) {
          const foodImages = req.files?.foodImages || [];
          const suggestionUploadCache = new Map();

          const itemsWithImages = await Promise.all(parsedItems.map(async (item) => {
            let imageUrl = item.imageUrl;
            if (item.customImageIndex != null) {
              const idx = Number(item.customImageIndex);
              const file = foodImages[idx];
              if (file) {
                imageUrl = normaliseUploadPath(file);
              }
            } else if (imageUrl) {
              imageUrl = await uploadSuggestionImageToCloudinary(
                imageUrl,
                item.name,
                suggestionUploadCache
              );
            }
            return {
              name: item.name,
              imageUrl,
              guestSlab: item.guestSlab,
              mealCategory: item.mealCategory,
              pricePerHead: item.pricePerHead,
            };
          }));
          update.items = itemsWithImages;
        } else {
          delete update.items;
        }
      } catch (err) {
        return next(err);
      }
    }

    const menu = await Menu.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    res.json(menu);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/menu/:id
 */
async function deleteMenu(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Menu.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.json({ message: "Menu deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/menu/food-suggestions?q=
 */
async function getFoodSuggestions(req, res, next) {
  try {
    const q = (req.query.q || "").toString().toLowerCase();

    await ensureFoodItemsCloudinarySynced();

    if (!q) {
      return res.json([]);
    }

    const matches = foodItems
      .filter((item) => item.name.toLowerCase().includes(q))
      .slice(0, 10);

    res.json(matches);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createMenu,
  getMenusByCaterer,
  getPublicMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
  getFoodSuggestions,
};

