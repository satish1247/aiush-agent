import { auth } from "../firebaseConfig";
import { Message, AiushResponse } from "../types";
import { onAuthStateChanged } from "firebase/auth";

// --- CONFIGURATION ---
const API_BASE_URL =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  "https://us-central1-aiush-agent.cloudfunctions.net/api";

// --- AUTH WAITER ---
const waitForAuth = (): Promise<void> => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve();
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe();
      resolve();
    });
  });
};

// --- TOKEN HELPER ---
const getValidToken = async (): Promise<string> => {
  await waitForAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");
  return await user.getIdToken(true);
};

// --- GENERIC API POST ---
const apiPost = async (endpoint: string, body: any) => {
  try {
    const token = await getValidToken();
    const fullUrl = `${API_BASE_URL}${endpoint}`;

    console.log(`📡 Calling API: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      if (text.startsWith("<!DOCTYPE html>")) {
        throw new Error(`Server Error ${response.status}: Backend crashed.`);
      }
      throw new Error(`API Error ${response.status}: ${text}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`❌ POST ${endpoint} failed:`, error);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Cannot connect to server.");
    }
    throw error;
  }
};

// --- EXPORTS ---
export const apiService = {
  healthCheck: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      console.log("Health:", await res.json());
    } catch {
      console.warn("Backend offline.");
    }
  },

  sendMessage: async (text: string, history: Message[]) =>
    apiPost("/aiush/message", {
      message: text,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    }),

  analyzeImage: async (imageBase64: string) =>
    apiPost("/aiush/ocr", { image: imageBase64 }),

  transcribeAudio: async (audioBlob: Blob) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          const data = await apiPost("/aiush/voice", { audio: base64 });
          resolve(data.transcript);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  },

  generateSpeech: async (text: string) =>
    (await apiPost("/aiush/tts", { text })).audioUrl,
};
