// routes/adminRoutes.js
import express from "express";
import { adminDashboard } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect this route → only admins can access
router.get("/admin/dashboard", protect, authorize("admin"), adminDashboard);

export default router;
