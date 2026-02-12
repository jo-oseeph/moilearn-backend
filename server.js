import "dotenv/config";

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import User from './models/User.js';

// Connect to database
connectDB();

// Create express app
const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",   // Vite dev server
  process.env.CLIENT_URL      // Production frontend from Render env
].filter(Boolean);

// Middleware: Enable CORS with credentials
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / server requests

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware: parse JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/user', userRoutes);  // This handles /api/user/profile, /api/user/stats, etc.
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('MoiLearn Backend is running!');
});

// Add this AFTER your existing routes (before app.listen)
app.get('/api/migrate-users', async (req, res) => {
  try {
    const usersToUpdate = await User.find({
      $or: [
        { authMethods: { $exists: false } },
        { authMethods: { $size: 0 } }
      ]
    });

    for (const user of usersToUpdate) {
      const authMethods = [];
      if (user.password) authMethods.push('email');
      if (user.googleId || user.provider === 'google') authMethods.push('google');
      if (authMethods.length === 0) authMethods.push('email');
      
      user.authMethods = authMethods;
      await user.save();
    }

    res.json({ success: true, migrated: usersToUpdate.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});