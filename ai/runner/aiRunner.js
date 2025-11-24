import { routerAgent } from "../agents/routerAgent.js";
import { generalAgent } from "../agents/generalAgent.js";
import { createLLMClient } from "../llm/geminiAIClient.js";
import { tools } from "../tools/index.js";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { weatherPrompts } from "../prompts/index.js";

export const runAIEngine = async (prompt) => {
  // Get all required agents (can be multiple)
  const routes = await routerAgent(prompt);
  console.log("🎯 ROUTES:", routes);

  const results = {};

  // Process weather agent if needed
  if (routes.includes("weather")) {
    console.log("📌 PROCESSING WEATHER AGENT");
    results.weather = await processWeatherAgent(prompt);
  }

  // Process general agent if needed
  if (routes.includes("general")) {
    console.log("📌 PROCESSING GENERAL AGENT");
    results.general = await processGeneralAgent(prompt);
  }

  // If both agents were used, combine responses
  if (results.weather && results.general) {
    return {
      success: true,
      agents: ["weather", "general"],
      response: await combineResponses(prompt, results),
      data: {
        weather: results.weather.data,
        general: results.general.response
      }
    };
  }

  // Single agent response
  if (results.weather) {
    return {
      success: true,
      agents: ["weather"],
      response: results.weather.response,
      data: results.weather.data
    };
  }

  return {
    success: true,
    agents: ["general"],
    response: results.general.response
  };
};

// Weather agent logic (extracted from main function)
async function processWeatherAgent(prompt) {
  const llm = createLLMClient();
  
  const toolsArray = Object.values(tools);
  const llmWithTools = llm.bindTools(toolsArray);
  const toolNode = new ToolNode(toolsArray);

  // Step 1: AI decides to use the weather tool
  const response = await llmWithTools.invoke([
    new SystemMessage(weatherPrompts.systemPrompt),
    new HumanMessage(prompt),
  ]);

  console.log("LLM RESPONSE:", response);

  // Check if there are multiple tool calls
  const toolCalls = response.tool_calls || [];
  
  if (toolCalls.length === 0) {
    return { response: "Weather tool was not triggered.", data: null };
  }

  console.log("⚒️ TOOL CALLS:", toolCalls);

  // Execute all tool calls
  const allWeatherData = [];
  
  for (const toolCall of toolCalls) {
    console.log("🔧 Executing tool:", toolCall.name, "with args:", toolCall.args);
    
    const result = await toolNode.invoke({ 
      messages: [new AIMessage({ content: "", tool_calls: [toolCall] })] 
    });
    
    const toolMessage = result.messages[0];
    
    // ✅ ADD THIS: Log what the tool actually returned
    console.log("📦 RAW TOOL RESPONSE:", toolMessage.content);
    console.log("📦 RESPONSE TYPE:", typeof toolMessage.content);
    console.log("📦 FIRST 100 CHARS:", toolMessage.content.substring(0, 100));
    
    // ✅ ADD THIS: Try to parse with error handling
    let weatherData;
    try {
      weatherData = JSON.parse(toolMessage.content);
      console.log("✅ Successfully parsed JSON");
    } catch (parseError) {
      console.error("❌ JSON PARSE ERROR:", parseError.message);
      console.error("❌ CONTENT THAT FAILED:", toolMessage.content);
      
      // Return user-friendly error
      return {
        response: `Sorry, I couldn't get the weather data. The API returned: ${toolMessage.content}`,
        data: null
      };
    }
    
    allWeatherData.push({ city: toolCall.args.location, data: weatherData });
  }

  // AI interprets all the data
  const finalResponse = await llm.invoke([
    new SystemMessage(weatherPrompts.interpretationPrompt),
    new HumanMessage(prompt),
    new HumanMessage(`Weather data for all requested cities:\n${JSON.stringify(allWeatherData, null, 2)}`)
  ]);

  return {
    response: finalResponse.content,
    data: allWeatherData
  };
}

// General agent logic
async function processGeneralAgent(prompt) {
  const response = await generalAgent(prompt);
  return {
    response: response
  };
}

// Combine multiple agent responses naturally
async function combineResponses(prompt, results) {
  const llm = createLLMClient();

  const combinedContext = `
User asked: "${prompt}"

Weather Agent Response:
${results.weather?.response || "N/A"}

General Agent Response:
${results.general?.response || "N/A"}
`;

  const finalResponse = await llm.invoke([
    new SystemMessage(`You are a helpful assistant that combines multiple responses into one coherent answer.

Guidelines:
- Merge the information naturally
- Don't repeat yourself
- Keep it conversational
- Maintain all important details from both responses
- Use emojis naturally`),
    new HumanMessage(combinedContext)
  ]);

  return finalResponse.content;
}
