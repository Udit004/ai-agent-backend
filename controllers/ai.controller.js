import { runAIEngine } from "../ai/index.js";
import { conversationManager } from "../ai/memory/conversationMemory.js";
import { v4 as uuidv4 } from "uuid";

export const runAI = async (req, res) => {
  try {
    const { prompt, sessionId = uuidv4() } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Get conversation history
    const history = await conversationManager.getHistory(sessionId);

    // Run AI with context
    const output = await runAIEngine(prompt, history);

    // Save conversation
    await conversationManager.addMessage(sessionId, "human", prompt);
    await conversationManager.addMessage(sessionId, "ai", output.response);

    res.json({
      success: true,
      sessionId,
      agents: output.agents,
      response: output.response,
      data: output.data,
    });
  } catch (error) {
    res.status(500).json({
      message: "AI request failed",
      error: error.message,
    });
  }
};

// ✅ NEW: SSE Streaming endpoint
export const streamAI = async (req, res) => {
  try {
    const { prompt, sessionId = uuidv4() } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // 🔧 Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

    // Get conversation history
    const history = await conversationManager.getHistory(sessionId);

    // Send initial event (optional)
    res.write(`data: ${JSON.stringify({ type: "start", sessionId })}\n\n`);

    // Stream AI response
    await streamAIEngine(prompt, history, {
      // Callback for each chunk
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);
      },
      // Callback when agents are determined
      onAgents: (agents) => {
        res.write(`data: ${JSON.stringify({ type: "agents", agents })}\n\n`);
      },
      // Callback when tool is called
      onToolCall: (toolName, args) => {
        res.write(`data: ${JSON.stringify({ type: "tool", name: toolName, args })}\n\n`);
      },
      // Callback when complete
      onComplete: async (fullResponse, agents, data) => {
        // Save to conversation history
        await conversationManager.addMessage(sessionId, "human", prompt);
        await conversationManager.addMessage(sessionId, "ai", fullResponse);

        // Send final event
        res.write(`data: ${JSON.stringify({ 
          type: "complete", 
          response: fullResponse,
          agents,
          data 
        })}\n\n`);
        
        // End the stream
        res.write("data: [DONE]\n\n");
        res.end();
      },
      // Callback for errors
      onError: (error) => {
        res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
        res.end();
      }
    });

  } catch (error) {
    console.error("❌ Stream error:", error);
    res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
    res.end();
  }
};
