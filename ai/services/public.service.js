import { createLLMClient } from '../llm/geminiAIClient.js';
import { getSystemPrompt } from '../prompts/public_prompts/portfolioPrompt.js';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

export const runPortfolioChat = async (message) => {
    try {
        // Get contextual system prompt based on user message
        const systemPrompt = getSystemPrompt(message);
        
        // Create LLM instance
        const llm = createLLMClient();
        
        // Generate response using Gemini with LangChain's invoke method
        const response = await llm.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(message)
        ]);
        
        return response.content;
    } catch (error) {
        console.error('Error in portfolio chat:', error);
        
        // Return friendly error messages
        if (error.message?.includes('API key')) {
            return "API configuration issue. Please contact the developer to fix the API setup.";
        } else if (error.message?.includes('403')) {
            return "API access issue. The API key might need proper permissions or billing setup.";
        } else if (error.message?.includes('404')) {
            return "API endpoint issue. The service might be temporarily unavailable.";
        } else if (error.message?.includes('429')) {
            return "Rate limit exceeded. Please try again later.";
        } else if (error.message?.includes('SAFETY')) {
            return "Response was blocked by safety filters. Please rephrase your message.";
        } else {
            return "I'm having trouble connecting right now. Feel free to ask me anything else, or you can reach out to Udit directly at rajankumart266@gmail.com!";
        }
    }
};