import express from 'express';
import { registerUser, loginUser, logoutUser }  from '../controllers/authController.js';
import { googleLogin } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/logout", logoutUser);
router.post("/google", googleLogin);



export default router;
