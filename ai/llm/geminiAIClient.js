import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { modelConfig } from "./modelConfig.js";
import { Client } from "langsmith";

const client = new Client({
  apiKey: process.env.LANGSMITH_API_KEY
});

export const createLLMClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY.trim(),
    model: modelConfig.model,
    temperature: modelConfig.temperature,
    maxOutputTokens: modelConfig.maxOutputTokens,
    // Add callbacks for tracking
    callbacks: [
      {
        handleLLMStart: async (llm, prompts) => {
          console.log("🚀 LLM Start:", new Date().toISOString());
        },
        handleLLMEnd: async (output) => {
          console.log("✅ LLM End:", {
            tokens: output.llmOutput?.tokenUsage,
            latency: output.llmOutput?.latency
          });
        },
        handleLLMError: async (err) => {
          console.error("❌ LLM Error:", err);
        }
      }
    ]
  });
};

// Automatically tracks all LLM calls
