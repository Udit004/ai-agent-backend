import { createLLMClient } from "../llm/geminiAIClient.js";
import { parseLLMResponse } from "../llm/responseParser.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { modelConfig } from "../llm/modelConfig.js";

export const generalAgent = async (prompt) => {
  const llm = createLLMClient();

  const response = await llm.invoke([
    new SystemMessage(modelConfig.systemPrompt),
    new HumanMessage(prompt),
  ]);

  return parseLLMResponse(response);
};
