import supabase from '../utils/supabaseClient.js';
import Note from '../models/Note.js';
import  upload  from '../middleware/uploadMiddleware.js';

export const uploadNote = async (req, res) => {
  try {
    const {
      school,
      year,
      semester,
      courseCode,
      courseTitle,
      type,
    } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${type}/${timestamp}_${file.originalname}`;
    const contentType = file.mimetype;

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
      type,
      fileUrl,
      fileName,
      fileType: contentType,
      downloadsCount: 0,
      status: 'pending'
    });

    await note.save();

    res.status(201).json({ message: 'Note uploaded successfully', note });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


export const downloadNote = async (req, res) => {
  try {
    const noteId = req.params.id;

    // find note by _id
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // increment downloadsCount
    note.downloadsCount += 1;
    await note.save();

    // return the file URL
    return res.status(200).json({
      message: 'Download URL retrieved successfully',
      fileUrl: note.fileUrl
    });

    // (optional) — if you prefer redirect
    // return res.redirect(note.fileUrl);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



// List pending notes
export const listPendingNotes = async (req, res) => {
  try {
    const notes = await Note.find({ status: 'pending' }).populate('uploader', 'name email');
    res.status(200).json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Approve a note
export const approveNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.status = 'approved';
    await note.save();

    res.status(200).json({ message: 'Note approved', note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Reject a note
export const rejectNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.status = 'rejected';
    await note.save();

    res.status(200).json({ message: 'Note rejected', note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
