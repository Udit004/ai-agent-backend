import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load env variables
dotenv.config();

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import publicRoutes from './routes/public.routes.js';
import { authMiddleware } from "./middleware/auth.middleware.js";

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
};

connectDB();

// Create Express App
const app = express();

// Middlewares
// Configure CORS for frontend domain
app.use(cors({
  origin: ['https://uditportfolio-six.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes

// Register public routes BEFORE auth middleware (no auth required)
app.use('/api/public', publicRoutes);

// Protected routes (with auth middleware)
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/auth', authRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Agentic AI Backend Running...");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start Server - Use dynamic PORT for cloud platforms
const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel (Vercel handles this automatically)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
