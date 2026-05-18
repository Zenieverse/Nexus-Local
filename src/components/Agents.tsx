import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Cpu, Bot, Sparkles, Zap, Brain, Globe, Search, RefreshCcw, Shield } from 'lucide-react';
import { auth } from '../lib/firebase';
import { ChatService, MemoryService } from '../lib/services';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { useSettings } from '../lib/context/SettingsContext';

const AGENTS = [
  { id: 'nexus', name: 'Nexus Core', icon: <Cpu />, color: 'white', desc: 'Main orchestration engine' },
  { id: 'research', name: 'Research', icon: <Globe />, color: 'blue-500', desc: 'Web retrieval and synthesis' },
  { id: 'analyst', name: 'Analyst', icon: <Brain />, color: 'emerald-500', desc: 'Deep data reasoning' },
  { id: 'creative', name: 'Creative', icon: <Sparkles />, color: 'purple-500', desc: 'Generative ideation' }
];

export default function Agents({ initialQuery, onClearQuery }: { initialQuery?: string, onClearQuery?: () => void }) {
  const { settings } = useSettings();
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || !auth.currentUser) return;
    
    const userMessage = messageToSend;
    if (!overrideInput) setInput('');
    
    setLoading(true);

    try {
      let currentId = conversationId;
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
          model: "gemini-3.1-pro-preview",
          settings: settings,
          context: messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')
        })
      });
      const data = await response.json();
      
      if (currentId) {
        await ChatService.addMessage(currentId, 'assistant', data.text);
        await MemoryService.addMemory(auth.currentUser.uid, data.text, 'conversation', { agentId: selectedAgent.id, role: 'assistant' });
      } else {
        // Fallback for UI if Firebase fails
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
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
      <div className="w-64 space-y-4 shrink-0 overflow-y-auto pr-2">
        <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground px-2">Specialized Agents</h3>
        {AGENTS.map(agent => (
          <button 
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className={cn(
              "w-full p-4 rounded-2xl border transition-all text-left group",
              selectedAgent.id === agent.id 
                ? "bg-white/10 border-white/20 glow" 
                : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors",
              selectedAgent.id === agent.id ? "bg-white text-black" : "bg-white/5 text-muted-foreground group-hover:text-white"
            )}>
              {agent.icon}
            </div>
            <p className="font-bold text-sm tracking-tight">{agent.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{agent.desc}</p>
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
                     <Shield size={10} /> Offline
                   </div>
                 )}
                 {settings.autonomousTools && (
                   <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                     <Zap size={10} /> Auto-Tools
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
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="p-6 rounded-full bg-white/5 border border-white/10">
                <Bot size={48} />
              </div>
              <div>
                <p className="text-lg font-medium">Hello, {auth.currentUser?.displayName?.split(' ')[0]}</p>
                <p className="text-sm">How can {selectedAgent.name} assist you locally today?</p>
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4",
                  m.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                  m.role === 'user' ? "bg-zinc-800 border-white/10" : "bg-white text-black border-white"
                )}>
                  {m.role === 'user' ? <User size={16} /> : <Cpu size={16} />}
                </div>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed markdown-body",
                  m.role === 'user' ? "bg-white/5 border border-white/10 italic text-zinc-300" : "bg-white/10 border border-white/20 text-white"
                )}>
                   <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shrink-0 border border-white">
                <Cpu size={16} />
              </div>
              <div className="max-w-[80%] p-4 rounded-2xl bg-white/10 border border-white/10 text-sm">
                <div className="flex gap-1">
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1 h-2 bg-white rounded-full" />
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1 h-2 bg-white rounded-full" />
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>
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
