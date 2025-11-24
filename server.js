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
app.use(cors());
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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
