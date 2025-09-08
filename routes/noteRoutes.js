import express from 'express';
import { uploadNote } from '../controllers/noteController.js';
import { getMyUploads } from '../controllers/noteController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { downloadNote } from '../controllers/noteController.js';
import {
  listPendingNotes,
  approveNote,
  rejectNote
} from '../controllers/noteController.js';


const router = express.Router();


router.post('/upload', protect, upload.single('file'), uploadNote);
router.get('/moderation', protect, isAdmin, listPendingNotes);
router.get('/:id/download', downloadNote);
router.get("/my-uploads", protect, getMyUploads);


// admin moderation routes

router.patch('/:id/approve', protect, isAdmin, approveNote);
router.patch('/:id/reject', protect, isAdmin, rejectNote);

export default router;
