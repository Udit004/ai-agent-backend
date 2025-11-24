import { createLLMClient } from "../llm/geminiAIClient.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { routerPrompts } from "../prompts/index.js";

export const routerAgent = async (userPrompt) => {
  const llm = createLLMClient();

  const response = await llm.invoke([
    new SystemMessage(routerPrompts.systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  console.log("🔍 ROUTER RAW RESPONSE:", response.content);

  try {
    // Clean the response (remove markdown code blocks if present)
    let cleanedContent = response.content.trim();
    
    // Remove markdown code blocks
    cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const parsed = JSON.parse(cleanedContent);
    return parsed.agents || ["general"]; // Default to general if parsing fails
  } catch (error) {
    console.log("Router parsing failed, defaulting to general", error);
    return ["general"];
  }
};
