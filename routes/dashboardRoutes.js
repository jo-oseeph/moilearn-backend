import express from "express";
import { userDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

// User dashboard
router.get("/", userDashboard);

export default router;
