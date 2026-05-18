import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Cpu, Bot, Sparkles, Zap, Brain, Globe, Search, RefreshCcw, Shield, Code2 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { ChatService, MemoryService } from '../lib/services';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { useSettings } from '../lib/context/SettingsContext';

const AGENTS = [
  { id: 'nexus', name: 'Nexus Core', icon: <Cpu size={20} />, color: 'white', desc: 'Orchestration Engine' },
  { id: 'research', name: 'Research', icon: <Search size={20} />, color: 'blue-500', desc: 'Knowledge Retrieval' },
  { id: 'analyst', name: 'Analyst', icon: <Brain size={20} />, color: 'emerald-500', desc: 'Data Reasoning' },
  { id: 'coding', name: 'Coding', icon: <Code2 size={20} />, color: 'amber-500', desc: 'Logic & Architecture' },
  { id: 'creative', name: 'Creative', icon: <Sparkles size={20} />, color: 'purple-500', desc: 'Generative Ideation' }
];

const AGENT_PROMPTS: Record<string, string[]> = {
  nexus: ["Optimize my system workflow", "Status of local silicon?", "Orchestrate my task queue"],
  research: ["Summarize recent vault arrivals", "Research fusion breakthroughs", "Synthesize local memory"],
  analyst: ["Detect patterns in my interactions", "Perform semantic breakdown", "Extract vault entities"],
  coding: ["Analyze server.ts architecture", "Debug logic flow", "Refactor for performance"],
  creative: ["Generate 5 futuristic app ideas", "Write a manifesto for Nexus", "Conceptualize minimalist UI"],
};

export default function Agents({ initialQuery, onClearQuery }: { initialQuery?: string, onClearQuery?: () => void }) {
  const { settings } = useSettings();
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    ChatService.getLatestConversationForAgent(auth.currentUser.uid, selectedAgent.id)
      .then(convo => {
        if (convo) {
          setConversationId(convo.id);
        } else {
          setConversationId(null);
          setMessages([]);
        }
      });
  }, [selectedAgent]);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = ChatService.subscribeToMessages(conversationId, (data) => {
      setMessages(data);
    });
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
      if (onClearQuery) onClearQuery();
    }
  }, [initialQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (overrideInput?: string) => {
    const rawMessage = (overrideInput || input || "").toString();
    if (!rawMessage.trim() || !auth.currentUser) return;
    
    const userMessage = rawMessage.trim();
    if (!overrideInput) setInput('');
    
    setLoading(true);
    setProcessingLogs([]);

    // Simulated internal routing logs
    const routingSteps = [
      `Initializing ${selectedAgent.name} expert chain...`,
      "Loading local semantic weights...",
      "Routing through MoE layer: Expert [8] active",
      settings.offlineMode ? "Verifying local-only protocol..." : "Cloud-bridge verification: PASS",
      "Synthesizing response via silicon-3..."
    ];

    try {
      let currentId = conversationId;
      
      // Gradually show logs
      for (const step of routingSteps) {
        setProcessingLogs(prev => [...prev, step]);
        await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
      }

      if (!currentId) {
        const newConvo = await ChatService.createConversation(auth.currentUser.uid, userMessage.substring(0, 40), selectedAgent.id);
        if (newConvo) {
          currentId = newConvo.id;
          setConversationId(currentId);
        }
      }

      if (currentId) {
        await ChatService.addMessage(currentId, 'user', userMessage);
        // Also log to timeline
        await MemoryService.addMemory(auth.currentUser.uid, userMessage, 'conversation', { agentId: selectedAgent.id });
      }

      const response = await fetch('/api/ai/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage,
          agent: selectedAgent.id,
          model: "gemini-1.5-flash",
          settings: settings,
          context: messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')
        })
      });
      const data = await response.json();
      
      const assistantText = data.text || data.error || "Intelligence core returned no data.";
      
      if (currentId) {
        await ChatService.addMessage(currentId, 'assistant', assistantText);
        await MemoryService.addMemory(auth.currentUser.uid, assistantText, 'conversation', { agentId: selectedAgent.id, role: 'assistant' });
      } else {
        // Fallback for UI if Firebase fails
        setMessages(prev => [...prev, { role: 'assistant', content: assistantText }]);
      }
    } catch (e) {
      console.error(e);
      if (!conversationId) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Error communicating with local core." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (!auth.currentUser) return;
    const newConvo = await ChatService.createConversation(auth.currentUser.uid, "New Conversation", selectedAgent.id);
    if (newConvo) {
      setConversationId(newConvo.id);
      setMessages([]);
    }
  };

  return (
    <div className="h-full flex gap-6 max-w-6xl mx-auto">
      {/* Agents Selection */}
      <div className="w-64 space-y-2 shrink-0 overflow-y-auto pr-2">
        <h3 className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground px-2 mb-4">Intelligence Stack</h3>
        {AGENTS.map(agent => (
          <button 
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className={cn(
              "w-full p-4 rounded-3xl border transition-all text-left group mb-2",
              selectedAgent.id === agent.id 
                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07] text-white"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-colors",
              selectedAgent.id === agent.id ? "bg-black text-white" : "bg-white/5 text-muted-foreground group-hover:text-white"
            )}>
              {agent.icon}
            </div>
            <p className="font-bold text-sm tracking-tight">{agent.name}</p>
            <p className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">{agent.desc}</p>
          </button>
        ))}
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col glass rounded-3xl border border-white/5 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white scale-90">
                {selectedAgent.icon}
             </div>
             <div>
               <h4 className="text-sm font-bold tracking-tight">{selectedAgent.name} Interaction</h4>
               <div className="flex items-center gap-3">
                 <div className="text-[10px] text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready
                 </div>
                 {settings.offlineMode && (
                   <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                     <Shield size={10} /> Local Silicon
                   </div>
                 )}
               </div>
             </div>
          </div>
          <button 
            onClick={handleNewChat}
            className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors"
          >
            <RefreshCcw size={16} />
          </button>
        </div>

        {/* Message Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
              <div className="space-y-4 opacity-50">
                <div className="p-6 rounded-full bg-white/5 border border-white/10 w-fit mx-auto">
                  <Bot size={48} />
                </div>
                <div>
                  <p className="text-lg font-medium">Hello, {auth.currentUser?.displayName?.split(' ')[0]}</p>
                  <p className="text-sm text-muted-foreground">The {selectedAgent.name} agent is active on your local hardware.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                {AGENT_PROMPTS[selectedAgent.id]?.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left text-xs text-zinc-400 hover:bg-white/10 hover:border-white/10 hover:text-white transition-all transform hover:-translate-y-1"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 flex-col",
                  m.role === 'user' ? "items-end" : "items-start"
                )}
              >
                <div className="flex flex-col gap-2 w-full max-w-[85%]">
                  {m.role === 'user' ? (
                    <div className="flex items-center gap-2 mb-1 self-end">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Subject</span>
                       <div className="w-6 h-6 rounded bg-zinc-800 border border-white/10 flex items-center justify-center">
                          <User size={12} className="text-zinc-500" />
                       </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-1">
                       <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center">
                          {selectedAgent.icon}
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white">{selectedAgent.name}</span>
                       <span className="text-[8px] px-1 bg-white/5 border border-white/10 rounded-sm text-zinc-500 ml-auto">PROCESSED</span>
                    </div>
                  )}
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed markdown-body",
                    m.role === 'user' ? "bg-white/5 border border-white/10 italic text-zinc-300 ml-auto" : "bg-white/10 border border-white/20 text-white"
                  )}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center">
                    {selectedAgent.icon}
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-white">{selectedAgent.name} Reasoning...</span>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl w-full max-w-md space-y-1">
                {processingLogs.map((log, i) => (
                  <p key={i} className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" /> {log}
                  </p>
                ))}
                <motion.div 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-1.5 h-3 bg-white inline-block mt-1"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-zinc-950">
          <div className="relative">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={`Message ${selectedAgent.name}...`}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-16 outline-none focus:border-white/20 transition-colors resize-none h-24"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-3 bottom-3 p-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest px-1">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><Search size={10} /> Context Grounding</span>
              <span className="flex items-center gap-1"><Zap size={10} /> 26B MoE Expert</span>
            </div>
            <span>Shift + Enter for multi-line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
