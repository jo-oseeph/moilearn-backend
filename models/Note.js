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
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
