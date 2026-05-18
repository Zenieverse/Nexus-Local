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
  const { prompt, context, agent = "nexus", model = "gemini-1.5-flash", settings = {} } = req.body;
  
  const agentInstructions: Record<string, string> = {
    nexus: "You are the Nexus Core, the main orchestration engine. Be analytical, strategic, and concise. Coordinate between sub-agents if necessary.",
    research: "You are the Research Agent. Focus on factual retrieval, web synthesis (simulated), and cross-referencing multi-document data.",
    analyst: "You are the Document Analyst. Extract deep semantic meaning, detect hidden patterns, and provide structural breakdowns.",
    creative: "You are the Creative Engine. Assist with high-level ideation, generative writing, and aesthetic conceptualization.",
    coding: "You are the Coding Copilot. Understand complex architectures, debug logic flows, and refactor code for performance and readability."
  };

  const offlineHint = settings.offlineMode ? "CRITICAL: You are running in OFFLINE PRIORITY MODE. All processing is restricted to local silicon. Do not suggest cloud-based alternatives." : "Cloud-augmentation is active for high-complexity tasks.";
  const toolsHint = settings.autonomousTools ? "Autonomous tool calling is ENABLED. You can simulate interaction with local terminal and file system." : "";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `You are NEXUS LOCAL, a privacy-first multimodal AI operating Core. 
        Current Context Identity: ${agentInstructions[agent] || agentInstructions.nexus}
        Hardware Status: 26B MoE Expert Chain active (simulated).
        Security Protocol: ${offlineHint}
        Permissions: ${toolsHint}
        
        Rules:
        1. Keep responses professional, technical, and high-fidelity.
        2. Prefix critical reasoning steps with [REASONING].
        3. If running in Offline Priority, emphasize your reliance on local intelligence.
        
        Previous Conversation Context:
        ${context || "No prior context."}`,
      }
    });

    // Post-process response to add expert header if needed
    let text = response.text;
    if (!text.includes('[SOURCE:')) {
      text = `[SOURCE: LOCAL_ एक्सपर्ट_CHAIN_${agent.toUpperCase()}]\n\n${text}`;
    }

    res.json({ text: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Intelligence core failure. Check logs." });
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
