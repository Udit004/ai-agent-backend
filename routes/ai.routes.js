import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { runAI } from "../controllers/ai.controller.js";

const router = express.Router();

// Protected: only logged-in users can use AI
router.post("/run", authMiddleware, runAI);

export default router;
