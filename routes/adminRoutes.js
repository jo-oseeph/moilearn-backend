//adminRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { approveNote, rejectNote, getPendingNotes, getAdminDashboardStats } from "../controllers/adminController.js";

const router = express.Router();

// Admin: view pending notes
router.get("/notes/pending", protect, authorize("admin"), getPendingNotes);

// Admin: approve a note
router.put("/notes/:id/approve", protect, authorize("admin"), approveNote);

// Admin: reject a note
router.put("/notes/:id/reject", protect, authorize("admin"), rejectNote);

//Admin stats
router.get("/dashboard", protect, authorize("admin"),  getAdminDashboardStats);

export default router;
