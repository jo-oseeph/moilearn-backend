import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, 
      trim: true,
      lowercase: true, 
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      // Password is only required for email/password auth, not for Google-only users
      required: function() {
        // If user has 'email' in authMethods, password is required
        // If user only has 'google' in authMethods, password is NOT required
        return this.authMethods && this.authMethods.includes('email');
      },
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user', 
    },
    authMethods: {
      type: [String],
      enum: ['email', 'google'],
      default: ['email'], // By default, users sign up with email
    },
    googleId: {
      type: String,
      sparse: true, // Allows multiple null values, but enforces uniqueness when set
      unique: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Compile schema into a model
const User = mongoose.model('User', userSchema);

export default User;