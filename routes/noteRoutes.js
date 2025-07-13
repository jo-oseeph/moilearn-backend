import express from 'express';
import { uploadNote } from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();


router.post('/upload', protect, upload.single('file'), uploadNote);

export default router;
