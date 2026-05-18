import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Gemini Initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.post("/api/ai/reason", async (req, res) => {
  const { prompt, context, agent = "nexus", model = "gemini-3.1-pro-preview", settings = {} } = req.body;
  
  const agentInstructions: Record<string, string> = {
    nexus: "You are the Nexus Core, the main orchestration engine. Be analytical and strategic.",
    research: "You are the Research Agent. Focus on factual retrieval and synthesis of multi-document data.",
    analyst: "You are the Document Analyst. Extract deep semantic meaning and detect patterns.",
    creative: "You are the Creative Engine. Assist with ideation and generative tasks.",
    coding: "You are the Coding Copilot. Understand architectures, debug, and refactor with precision."
  };

  const offlineHint = settings.offlineMode ? "CRITICAL: You are running in OFFLINE PRIORITY MODE. Do not suggest cloud-based solutions." : "";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: `You are NEXUS LOCAL, a privacy-first multimodal AI operating system. 
        Current Agent: ${agentInstructions[agent] || agentInstructions.nexus}
        Expert Mode: 26B MoE Expert Chain active.
        ${offlineHint}
        Context: ${context || ""}`,
      }
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate reasoning" });
  }
});

// Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NEXUS LOCAL running on http://localhost:${PORT}`);
  });
}

setupServer();
