// routes/userRoutes.js
import express from "express";
import { userDashboard } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getUserProfile, getUserStats } from "../controllers/userController.js";

const router = express.Router();

// Only normal users should access this
router.get("/dashboard", protect, authorize("user"), userDashboard);
router.get("/profile", protect, getUserProfile);
router.get("/stats", protect, getUserStats);


export default router;
