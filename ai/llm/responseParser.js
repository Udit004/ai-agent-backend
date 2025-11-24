export const parseLLMResponse = (response) => {
  try {
    if (!response) return "";

    // If content is simple string
    if (typeof response.content === "string") {
      return response.content;
    }

    // If content is array of segments
    if (Array.isArray(response.content)) {
      return response.content
        .map((c) =>
          typeof c === "string"
            ? c
            : c?.text
            ? c.text
            : ""
        )
        .join("");
    }

    // If text property exists
    if (response.text) {
      return response.text;
    }

    // Fallback
    return JSON.stringify(response);

  } catch (err) {
    return "Failed to parse AI response.";
  }
};
