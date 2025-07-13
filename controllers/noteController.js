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
