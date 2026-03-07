import "dotenv/config";
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import publicStatsRoutes from "./routes/publicStatsRoutes.js";


connectDB();

// Create express app
const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://moilearn.vercel.app"
];

// Enable CORS with dynamic origin check
app.use(cors({
  origin: function (origin, callback) {

    // Allow requests with no origin (like Postman or server-to-server)
    if (!origin) return callback(null, true);

    // Allow exact matches
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel preview deployments for your project
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Middleware: parse JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/user', userRoutes);  
app.use('/api/admin', adminRoutes);
app.use("/api/public-stats", publicStatsRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});