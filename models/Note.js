import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    school: {
      type: String,
      enum: [
        'School of Education',
        'School of Arts',
        'School of Science',
        'School of Information Sciences',
        'School of Agriculture',
        'School of Engineering',
      ],
      required: true,
    },
     category: {
      type: String,
      enum: ["note", "past_paper"],
      required: [true, "File type must be either 'note' or 'past_paper'"],
    },
    year: {
      type: String,
      enum: ['1', '2', '3', '4'],
      required: true,
    },
    semester: {
      type: String,
      enum: ['1', '2'],
      required: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
     mimeType: {
      type: String,
      required: true, // actual file format like application/pdf, image/jpeg
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // 👇 added downloadsCount
    downloadsCount: {
      type: Number,
      default: 0,
    },

  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
