import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Terminal, Layers, Play, Bug, FileJson, Cpu, Zap, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Coding() {
  const [activeFile, setActiveFile] = useState('server.ts');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setShowTerminal(true);
    setDeploymentLogs([]);
    
    const steps = [
      "Initializing NEXUS build pipeline...",
      "Checking local silicon availability...",
      "Quantizing Gemma 4 26B MoE weights...",
      "Expert routing table generation: COMPLETE.",
      "Bundling server-side logic...",
      "Injecting semantic memory hooks...",
      "Optimizing VRAM allocation...",
      "NEXUS LOCAL Instance: ONLINE",
      "Deployment synchronized at port 3000."
    ];

    for (const step of steps) {
      setDeploymentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
      await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
    }
    setIsDeploying(false);
  };

  const handleDebug = async () => {
    setIsDeploying(true);
    setShowTerminal(true);
    setDeploymentLogs([]);
    
    const steps = [
      "Attaching to process 3000...",
      "Extracting local memory stack...",
      "Analyzing expert routing table...",
      "DEBUG: Expert [Analyst] returned high-probability bias in token window 4.",
      "DEBUG: Expert [Nexus] logic branch optimized for silicon-first retrieval.",
      "Heap dump synchronized (245MB).",
      "Analyzing trace: /api/ai/reason -> server.ts:32",
      "No critical exceptions found. System is peak performant."
    ];

    for (const step of steps) {
      setDeploymentLogs(prev => [...prev, `[DEBUG] ${step}`]);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 800));
    }
    setIsDeploying(false);
  };

  return (
    <div className="h-full flex flex-col space-y-8">
       <header className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Coding Engine</h2>
          <p className="text-muted-foreground">Local repository synthesis and architectural reasoning.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleDeploy}
             disabled={isDeploying}
             className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-50"
           >
            <Play size={16} fill="black" className={cn(isDeploying && "animate-pulse")} /> 
            {isDeploying ? "Deploying..." : "Deploy"}
           </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex gap-6">
        {/* Repo Explorer */}
        <div className="w-56 glass border border-white/5 rounded-3xl p-4 flex flex-col shrink-0">
           <div className="px-2 py-2 mb-4">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Layers size={12} /> Repository
              </h3>
           </div>
           <div className="space-y-1 flex-1 overflow-y-auto">
             <FileItem name="package.json" active={activeFile === 'package.json'} onClick={() => setActiveFile('package.json')} />
             <FileItem name="server.ts" active={activeFile === 'server.ts'} onClick={() => setActiveFile('server.ts')} />
             <FileItem name="src/App.tsx" active={activeFile === 'src/App.tsx'} onClick={() => setActiveFile('src/App.tsx')} />
             <FileItem name="src/index.css" active={activeFile === 'src/index.css'} onClick={() => setActiveFile('src/index.css')} />
           </div>
           <div className="pt-4 border-t border-white/5 space-y-1">
             <button 
               disabled={isDeploying}
               onClick={() => setShowTerminal(true)}
               className="w-full p-2 text-left text-xs text-muted-foreground hover:text-white rounded-lg transition-colors flex items-center gap-2">
                <Search size={14} /> Semantic Search
             </button>
             <button 
               disabled={isDeploying}
               onClick={handleDebug}
               className="w-full p-2 text-left text-xs text-muted-foreground hover:text-white rounded-lg transition-colors flex items-center gap-2">
                <Bug size={14} /> Local Debugger
             </button>
           </div>
        </div>

        {/* Code Editor / Terminal Mockup */}
        <div className="flex-1 glass border border-white/5 rounded-3xl flex flex-col overflow-hidden relative">
           <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-white/[0.02]">
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowTerminal(false)}
                  className={cn("text-xs font-mono transition-colors", !showTerminal ? "text-white" : "text-zinc-500 hover:text-white")}
                >
                   Editor: {activeFile}
                </button>
                <button 
                  onClick={() => setShowTerminal(true)}
                  className={cn("text-xs font-mono transition-colors", showTerminal ? "text-white" : "text-zinc-500 hover:text-white")}
                >
                   Terminal
                </button>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                 <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/5">
                    MoE Logic: Active
                 </div>
              </div>
           </div>
           
           <div className="flex-1 p-6 font-mono text-sm overflow-hidden flex flex-col">
              {!showTerminal ? (
                <div className="flex-1 overflow-y-auto text-zinc-400">
                  <pre className="selection:bg-white selection:text-black">
{`import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// Memory System Initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Semantic Code Analysis Helper
async function analyzeArchitecture(repoPath: string) {
  const model = ai.getGenerativeModel({ 
    model: "gemini-3.1-pro-preview" 
  });
  
  // Implementation of long-context repo synthesis
}`}
                  </pre>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-1 text-emerald-500/80">
                  {deploymentLogs.length === 0 && <p className="text-zinc-600 italic">No active processes.</p>}
                  {deploymentLogs.map((log, i) => (
                    <motion.p 
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="whitespace-pre-wrap"
                    >
                      <span className="text-zinc-600 mr-2">{'>'}</span>{log}
                    </motion.p>
                  ))}
                  {isDeploying && (
                    <motion.div 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-2 h-4 bg-emerald-500 inline-block ml-1"
                    />
                  )}
                </div>
              )}

              {/* AI Insight Overlay */}
              {!showTerminal && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl relative mt-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 rounded bg-white text-black">
                        <Zap size={12} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">NEXUS AI Insight</span>
                    <button className="ml-auto text-muted-foreground hover:text-white" onClick={() => {}}><X size={14} /></button>
                  </div>
                  <p className="text-xs text-zinc-300">I recommend optimizing the <span className="text-white font-bold">analyzeArchitecture</span> function by implementing a sliding-window context management. This will improve token efficiency for large repositories.</p>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1.5 bg-white text-black text-[10px] font-bold rounded uppercase tracking-widest hover:bg-zinc-200">Refactor</button>
                    <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-[10px] font-bold rounded uppercase tracking-widest hover:bg-white/10">Explain</button>
                  </div>
                </motion.div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function FileItem({ name, active, onClick }: { name: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full p-2.5 flex items-center gap-2.5 rounded-xl transition-all group",
        active ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-lg border flex items-center justify-center transition-colors shadow-inner",
        active ? "bg-white text-black border-white" : "bg-white/5 border-white/5 group-hover:border-white/10"
      )}>
        <Code2 size={12} />
      </div>
      <span className="text-xs font-medium truncate">{name}</span>
    </button>
  );
}

function X({ size }: { size: number }) {
  return <Play size={size} className="rotate-45" />;
}
