const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const { protect } = require('../middleware/authMiddleware');

const SYSTEM_INSTRUCTION = `
You are Aiush Agent, a safe health-information AI assistant.
Strict safety rules:
- Never diagnose a disease.
- Never prescribe any medicine or dosage.
- Always say "consult a doctor" when symptoms are severe.
- Provide only general educational information.

Output format:
You MUST output strictly valid JSON.
{
  "reply": "short helpful message (40–90 words)",
  "lang": "en | hi | te",
  "tone": "teaching | friendly | serious | storytelling",
  "action": null,
  "medical_safety": "General info only. Not a diagnosis."
}
`;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// @desc    Send query to Aiush Agent
// @route   POST /aiush/query
// @access  Public (or Protected if you require login for all queries)
router.post('/query', async (req, res) => {
  const { text, image, history } = req.body;

  if (!process.env.API_KEY) {
    return res.status(500).json({ error: "Server missing API Key configuration" });
  }

  try {
    // Construct Prompt
    const contextString = history ? history.slice(-5).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') : "";
    const prompt = `
      Previous Context:
      ${contextString}
      
      User's Current Input:
      ${text}
    `;

    const parts = [{ text: prompt }];
    
    if (image) {
      // Expecting base64 string "data:image/jpeg;base64,..."
      const base64Data = image.split(',')[1] || image;
      parts.unshift({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      });
    }

    // Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        role: "user",
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    if (!response.text) {
      throw new Error("No response from AI model");
    }

    // Process Response (Clean Markdown)
    let jsonString = response.text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedResponse = JSON.parse(jsonString);

    // Extract Grounding
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const searchResults = [];
    if (groundingChunks) {
      groundingChunks.forEach(chunk => {
        if (chunk.web) {
          searchResults.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri || "#"
          });
        }
      });
    }

    res.json({
      ...parsedResponse,
      searchResults: searchResults.length > 0 ? searchResults : undefined
    });

  } catch (error) {
    console.error("AI Service Error:", error);
    res.status(500).json({ error: "Failed to process AI request", details: error.message });
  }
});

module.exports = router;