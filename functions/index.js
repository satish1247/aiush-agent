const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ------------------ CONFIG ------------------
const CONFIG = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "AIzaSyDse2QE0Eh3ClaNgMiuW5-pMmiNYBasQXk",
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || "e66dda617eaf5eca80778b9d228b76055e3e52dd",
  MURF_API_KEY: process.env.MURF_API_KEY || "ap2_ce080df0-5ca0-432b-ac4c-2db226e8baac",
  MURF_VOICE_ID: "en-US-marcus",
};

// ----------------- EXPRESS APP ------------------
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

// ---------------- AUTH MIDDLEWARE ----------------
const validateToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing Token" });
    }

    const token = header.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(403).json({ error: "Invalid Token" });
  }
};

// --------------- SYSTEM INSTRUCTION ----------------
const SYSTEM_PROMPT = `
You are Aiush Agent, a helpful health-information AI assistant.
Rules:
- Never diagnose.
- Never prescribe medicine or dosage.
- Always say "consult a doctor" for dangerous or persistent symptoms.
- Provide general educational info only.

Output JSON only:
{
  "reply": "...",
  "lang": "en|hi|te",
  "tone": "friendly|teaching|serious|storytelling",
  "action": null,
  "medical_safety": "General info only"
}
`;

// --------------- HISTORY HELPER (FIXED) ----------------
const saveHistory = async (uid, userMsg, aiResp, type) => {
  try {
    const userRef = db.collection("users").doc(uid);

    // Ensure root doc exists (fix for missing history)
    await userRef.set(
      { createdAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    // Now store message safely
    await userRef.collection("history").add({
      userMessage: userMsg,
      aiResponse: aiResp,
      type,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("History saved for UID:", uid);

  } catch (e) {
    console.error("Firestore Save Error:", e);
  }
};

// ---------------- ROUTES ----------------

// --- HEALTH CHECK ---
app.get("/health", (req, res) => {
  res.json({ status: "online", service: "Aiush Backend v2" });
});

// --- CHAT ENDPOINT ---
app.post("/aiush/message", validateToken, async (req, res) => {
  try {
    const { message } = req.body;

    const ai = new GoogleGenAI({ apiKey: CONFIG.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json"
      }
    });

    let parsed = {};
    try {
      parsed = JSON.parse(response.text);
    } catch {
      parsed = {
        reply: response.text,
        lang: "en",
        tone: "friendly",
        action: null,
        medical_safety: "Raw output"
      };
    }

    // Save to Firestore
    saveHistory(req.user.uid, message, parsed, "chat");

    res.json(parsed);

  } catch (e) {
    console.error("Chat Error:", e);
    res.status(500).json({ error: "Chat Failed", detail: e.message });
  }
});

// --- OCR ENDPOINT ---
app.post("/aiush/ocr", validateToken, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Image missing" });

    const cleanBase64 = image.includes("base64,")
      ? image.split("base64,")[1]
      : image;

    const ai = new GoogleGenAI({ apiKey: CONFIG.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: "Extract medicines and uses. Output JSON only." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text);

    saveHistory(req.user.uid, "[OCR Image]", parsed, "ocr");

    res.json(parsed);

  } catch (e) {
    console.error("OCR Error:", e);
    res.status(500).json({ error: "OCR Failed", detail: e.message });
  }
});

// --- VOICE ENDPOINT ---
app.post("/aiush/voice", validateToken, async (req, res) => {
  try {
    const { audio } = req.body;
    const buffer = Buffer.from(audio, "base64");

    const dg = await axios.post(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
      buffer,
      {
        headers: {
          Authorization: `Token ${CONFIG.DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/wav"
        }
      }
    );

    const transcript =
      dg.data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    res.json({ transcript });

  } catch (e) {
    console.error("Voice Error:", e.response?.data || e.message);
    res.status(500).json({ error: "Voice Failed" });
  }
});

// --- TTS ENDPOINT ---
app.post("/aiush/tts", validateToken, async (req, res) => {
  try {
    const { text } = req.body;

    const murf = await axios.post(
      "https://api.murf.ai/v1/speech/generate",
      { voiceId: CONFIG.MURF_VOICE_ID, text, format: "MP3" },
      { headers: { "api-key": CONFIG.MURF_API_KEY } }
    );

    res.json({ audioUrl: murf.data.audioFile });

  } catch (e) {
    console.error("TTS Error:", e.response?.data || e.message);
    res.status(500).json({ error: "TTS Failed" });
  }
});

// Export as Cloud Function
exports.api = onRequest(
  { cors: true, region: "us-central1" },
  app
);
