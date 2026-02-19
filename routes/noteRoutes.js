import express from 'express';
import {
  uploadNote,
  getMyUploads,
  downloadNote,
  getApprovedNotes,
  previewNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';


const router = express.Router();


//PUBLIC: approved notes
router.get('/', getApprovedNotes);

// Upload
router.post('/upload', protect, upload.array('files'), uploadNote);

// Download
router.get('/:id/download', downloadNote);

// Preview
router.get('/:id/preview', previewNote); 

// User uploads
router.get('/my-uploads', protect, getMyUploads);

export default router;
 