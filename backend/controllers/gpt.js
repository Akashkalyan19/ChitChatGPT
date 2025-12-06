// backend/controllers/gpt.js
const ai = require("../lib/geminiClient");

const getResponseFromGPT = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // or gemini-2.5-flash if available
      contents: prompt,
    });

    // NEW SDK returns final text at response.text
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error contacting AI service.";
  }
};

module.exports = { getResponseFromGPT };
