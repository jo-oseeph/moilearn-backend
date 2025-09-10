// routes/adminRoutes.js
import express from "express";
import { adminDashboard } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { approveNote, rejectNote, getPendingNotes } from "../controllers/adminController.js";

const router = express.Router();

// Admin dashboard
router.get("/dashboard", protect, authorize("admin"), adminDashboard);

// Admin: view pending notes
router.get("/notes/pending", protect, authorize("admin"), getPendingNotes);

// Admin: approve a note
router.put("/notes/:id/approve", protect, authorize("admin"), approveNote);

// Admin: reject a note
router.put("/notes/:id/reject", protect, authorize("admin"), rejectNote);

export default router;
