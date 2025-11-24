import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

class ConversationManager {
  constructor() {
    this.sessions = new Map(); // sessionId → ChatMessageHistory
  }

  getMemory(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new InMemoryChatMessageHistory());
    }
    return this.sessions.get(sessionId);
  }

  async addMessage(sessionId, role, content) {
    const chatHistory = this.getMemory(sessionId);
    
    if (role === "human" || role === "user") {
      await chatHistory.addMessage(new HumanMessage(content));
    } else if (role === "ai" || role === "assistant") {
      await chatHistory.addMessage(new AIMessage(content));
    }
  }

  async getHistory(sessionId) {
    const chatHistory = this.getMemory(sessionId);
    return await chatHistory.getMessages();
  }

  async clearHistory(sessionId) {
    if (this.sessions.has(sessionId)) {
      const chatHistory = this.getMemory(sessionId);
      await chatHistory.clear();
    }
  }

  // Get last N messages (useful for context window limits)
  async getRecentHistory(sessionId, limit = 10) {
    const messages = await this.getHistory(sessionId);
    return messages.slice(-limit);
  }
}

export const conversationManager = new ConversationManager();