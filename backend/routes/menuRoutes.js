// /api/menu/*

const express = require("express");
const {
  createMenu,
  getMenusByCaterer,
  getPublicMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
  getFoodSuggestions,
} = require("../controllers/menuController");
const { uploadMenuWithFoodImages } = require("../middleware/upload");

const router = express.Router();

// Create menu with menu image + optional custom food images
router.post("/", uploadMenuWithFoodImages, createMenu);

// Public listing for user UI
router.get("/public", getPublicMenus);

// All menus for a caterer
router.get("/caterer/:catererId", getMenusByCaterer);

// Food name suggestions
router.get("/food-suggestions", getFoodSuggestions);

// Single menu CRUD
router.get("/:id", getMenuById);
router.put("/:id", uploadMenuWithFoodImages, updateMenu);
router.delete("/:id", deleteMenu);

module.exports = router;

