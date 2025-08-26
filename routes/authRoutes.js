import express from 'express';
import { registerUser, loginUser, logoutUser }  from '../controllers/authController.js';
import { adminDashboard }  from '../controllers/dashboardController.js';
import { userDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/logout", logoutUser);
router.get('/dashboard', adminDashboard);
router.get("/dashboard", userDashboard);



export default router;
