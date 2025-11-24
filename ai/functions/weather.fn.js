export const weatherFunction = {
  name: "getWeather",
  description: "Get current weather details for a specific city.",
  parameters: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "Name of the city to fetch weather for",
      },
    },
    required: ["city"],
  },
};
