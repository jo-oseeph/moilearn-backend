import express from 'express';
import { uploadNote } from '../controllers/noteController.js';
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
router.get('/:id/download', downloadNote);

// admin moderation routes
router.get('/moderation', protect, isAdmin, listPendingNotes);
router.patch('/:id/approve', protect, isAdmin, approveNote);
router.patch('/:id/reject', protect, isAdmin, rejectNote);

export default router;
