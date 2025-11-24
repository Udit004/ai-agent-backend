import { tools } from "../tools/index.js";

export const weatherAgent = async (parsedFunctionCall) => {
  const { name, arguments: args } = parsedFunctionCall;

  if (!tools[name]) {
    return "Tool not found.";
  }

  const result = await tools[name].func(args);
  return result;
};
