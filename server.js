// Load environment variables from .env file FIRST
import dotenv from 'dotenv';
dotenv.config();

// Import libraries
import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/authroutes.js';
import noteRoutes from './routes/noteRoutes.js';


connectDB();

// Create express app
const app = express();

// Middleware: Parse incoming JSON in request body
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Test route to confirm server is running
app.get('/', (req, res) => {
  res.send(' MoiLearn Backend is running!');
});

// Define a port from env file or fallback to 5000
const PORT = process.env.PORT || 5000;

// Start the server and listen on the port
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
