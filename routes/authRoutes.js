import express from 'express';
import { registerUser, loginUser, logoutUser }  from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/logout", logoutUser);




export default router;
