import supabase from '../utils/supabaseClient.js';
import Note from '../models/Note.js';

// Upload a note or past paper
export const uploadNote = async (req, res) => {
  try {
    const {
      school,
      year,
      semester,
      courseCode,
      courseTitle,
      category, // 👈 now using category instead of "type"
    } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${category}/${timestamp}_${file.originalname}`;
    const contentType = file.mimetype; // 👈 e.g., application/pdf, image/jpeg

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(fileName, file.buffer, {
        contentType,
      });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to upload file to storage' });
    }

    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${data.path}`;

    // Save metadata in MongoDB
    const note = new Note({
      uploader: req.user._id,
      school,
      year,
      semester,
      courseCode,
      courseTitle,
      category,
      fileUrl,
      mimeType: contentType, // 👈 stored here
      downloadsCount: 0,
      status: 'pending',
    });

    await note.save();

    res.status(201).json({ message: 'File uploaded successfully', note });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Download note or past paper
export const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    // Validate note existence and status
    if (!note || note.status !== 'approved') {
      return res.status(404).json({ message: 'File not found' });
    }

    // Increment downloads count
    note.downloadsCount += 1;
    await note.save();

    // Fetch the file from Supabase
    const response = await fetch(note.fileUrl);
    
    if (!response.ok) {
      return res.status(500).json({ message: 'Failed to fetch file from storage' });
    }

    const fileBuffer = await response.arrayBuffer();
    
    // Extract filename from the fileUrl or use a default
    const urlParts = note.fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1] || `${note.courseCode}_${note.courseTitle}.pdf`;
    
    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', note.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', fileBuffer.byteLength);
    
    // Send the file
    return res.send(Buffer.from(fileBuffer));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Preview note (opens in browser without incrementing download count)
export const previewNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    // Validate note existence and status
    if (!note || note.status !== 'approved') {
      return res.status(404).json({ message: 'File not found' });
    }

    // Redirect to Supabase URL for preview (opens in browser)
    return res.redirect(note.fileUrl);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// List pending uploads
export const listPendingNotes = async (req, res) => {
  try {
    const notes = await Note.find({ status: 'pending' }).populate('uploader', 'name email');
    res.status(200).json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Approve an upload
export const approveNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'File not found' });
    }

    note.status = 'approved';
    await note.save();

    res.status(200).json({ message: 'File approved', note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Reject an upload
export const rejectNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'File not found' });
    }

    note.status = 'rejected';
    await note.save();

    res.status(200).json({ message: 'File rejected', note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Public: get approved notes
export const getApprovedNotes = async (req, res) => {
  try {
    const notes = await Note.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .populate('uploader', 'username');

    res.status(200).json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch approved notes' });
  }
};


// Get all uploads for the logged-in user
export const getMyUploads = async (req, res) => {
  try {
    const notes = await Note.find({ uploader: req.user._id })
      .sort({ createdAt: -1 }); // show newest first

    res.status(200).json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
