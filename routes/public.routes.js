import express from 'express';
import { portfolioChatController } from '../controllers/public.controller.js';

const router = express.Router();

// Public chat endpoint (no auth required)
router.post('/chat', portfolioChatController);

export default router;