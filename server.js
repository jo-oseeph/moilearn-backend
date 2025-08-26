// Load environment variables from .env file FIRST
import dotenv from 'dotenv';
dotenv.config();

// Import libraries
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from "./routes/userRoutes.js";



connectDB();

// Create express app
const app = express();

// Middleware: Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // allow frontend origin or all if not defined
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware: Parse incoming JSON in request body
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use("/user", userRoutes);
app.use('/api/admin', adminRoutes);

// Test route to confirm server is running
app.get('/', (req, res) => {
  res.send('MoiLearn Backend is running!');
});

// Define a port from env file or fallback to 5000
const PORT = process.env.PORT || 5000;

// Start the server and listen on the port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
