import express from 'express';
import { uploadNote } from '../controllers/noteController.js';
import { getMyUploads } from '../controllers/noteController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { downloadNote } from '../controllers/noteController.js';



const router = express.Router();


router.post('/upload', protect, upload.single('file'), uploadNote);
router.get('/:id/download', downloadNote);
router.get("/my-uploads", protect, getMyUploads);




export default router;
