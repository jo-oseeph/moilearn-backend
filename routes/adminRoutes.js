// routes/adminRoutes.js
import express from "express";
import { adminDashboard } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { approveMaterial, rejectMaterial, getPendingMaterials } from "../controllers/adminController.js";

const router = express.Router();

// Protect this route → only admins can access
router.get("/admin/dashboard", protect, authorize("admin"), adminDashboard);


// Admin: view pending materials
router.get("/pending", protect, authorize("admin"), getPendingMaterials);

// Admin: approve material
router.put("/approve/:id", protect, authorize("admin"), approveMaterial);

// Admin: reject material
router.put("/reject/:id", protect, authorize("admin"), rejectMaterial);

export default router;
