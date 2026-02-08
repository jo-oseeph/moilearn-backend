import express from "express";
import { userDashboard } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getUserProfile, getUserStats, updateProfile, deleteAccount } from "../controllers/userController.js";

const router = express.Router();

// User dashboard - only for regular users
router.get("/dashboard", protect, authorize("user"), userDashboard);

// User stats
router.get("/stats", protect, getUserStats);

// Profile routes (accessible by all authenticated users)
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteAccount);

export default router;