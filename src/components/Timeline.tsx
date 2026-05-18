import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, FileText, MessageSquare, Mic, Camera, Code2, Tag, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { MemoryService } from '../lib/services';
import { auth } from '../lib/firebase';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Timeline() {
  const [memories, setMemories] = useState<any[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [range, setRange] = useState<'all' | '24h' | '7d'>('all');
  const [showRange, setShowRange] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = MemoryService.subscribeToMemories(auth.currentUser.uid, (data) => {
      setMemories(data);
    });
    return unsubscribe;
  }, []);

  const filteredMemories = memories.filter(m => {
    const typeMatch = !filter || m.type === filter;
    if (!typeMatch) return false;

    if (range === 'all') return true;
    if (!m.timestamp) return true;
    
    const date = m.timestamp.toDate ? m.timestamp.toDate() : new Date();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (range === '24h') return diff < 24 * 60 * 60 * 1000;
    if (range === '7d') return diff < 7 * 24 * 60 * 60 * 1000;
    
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Semantic Timeline</h2>
          <p className="text-muted-foreground">Historical recall of all AI-processed interactions.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="relative">
             <button 
               onClick={() => { setShowFilters(!showFilters); setShowRange(false); }}
               className={cn(
                 "px-4 py-2 border rounded-lg text-sm flex items-center gap-2 transition-all",
                 filter ? "bg-white text-black border-white" : "bg-white/5 border-white/10 hover:bg-white/10"
               )}
             >
              <Filter size={16} /> {filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : 'Filter'}
             </button>
             
             <AnimatePresence>
               {showFilters && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute right-0 mt-2 w-48 p-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50"
                 >
                   {['conversation', 'file', 'screenshot', 'voice', 'code'].map(type => (
                     <button
                       key={type}
                       onClick={() => { setFilter(filter === type ? null : type); setShowFilters(false); }}
                       className={cn(
                         "w-full text-left px-3 py-2 rounded-lg text-xs font-medium uppercase tracking-widest hover:bg-white/5 transition-colors",
                         filter === type ? "text-white bg-white/10" : "text-zinc-500"
                       )}
                     >
                       {type}
                     </button>
                   ))}
                   {filter && (
                     <button 
                       onClick={() => { setFilter(null); setShowFilters(false); }}
                       className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 mt-1"
                     >
                       Clear Filter
                     </button>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
           
           <div className="relative">
             <button 
                onClick={() => { setShowRange(!showRange); setShowFilters(false); }}
                className={cn(
                  "px-4 py-2 border rounded-lg text-sm flex items-center gap-2 transition-all",
                  range !== 'all' ? "bg-white text-black border-white" : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
             >
              <CalendarIcon size={16} /> {range === 'all' ? 'All Time' : range === '24h' ? 'Last 24h' : 'Last 7d'}
             </button>
             <AnimatePresence>
               {showRange && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute right-0 mt-2 w-48 p-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50"
                 >
                   {[
                     { id: 'all', label: 'All Time' },
                     { id: '24h', label: 'Last 24 Hours' },
                     { id: '7d', label: 'Last 7 Days' }
                   ].map(r => (
                     <button
                       key={r.id}
                       onClick={() => { setRange(r.id as any); setShowRange(false); }}
                       className={cn(
                         "w-full text-left px-3 py-2 rounded-lg text-xs font-medium uppercase tracking-widest hover:bg-white/5 transition-colors",
                         range === r.id ? "text-white bg-white/10" : "text-zinc-500"
                       )}
                     >
                       {r.label}
                     </button>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </header>

      <div className="space-y-4 relative before:absolute before:left-[19px] before:top-4 before:bottom-0 before:w-px before:bg-white/5">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <History className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">
              {filter ? `No ${filter} memories found.` : "No memories recorded yet. Start interacting with NEXUS."}
            </p>
          </div>
        ) : (
          filteredMemories.map((memory, index) => (
            <MemoryCard key={memory.id} memory={memory} index={index} />
          ))
        )}
      </div>
    </div>
  );
}

interface MemoryCardProps {
  memory: any;
  index: number;
}

function MemoryCard({ memory, index }: MemoryCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'file': return <FileText size={18} />;
      case 'conversation': return <MessageSquare size={18} />;
      case 'voice': return <Mic size={18} />;
      case 'screenshot': return <Camera size={18} />;
      case 'code': return <Code2 size={18} />;
      default: return <History size={18} />;
    }
  };

  const formattedDate = memory.timestamp?.toDate ? format(memory.timestamp.toDate(), 'MMMM d, HH:mm') : 'Recently';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-6 group"
    >
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-white transition-colors group-hover:border-white/20">
          {getIcon(memory.type)}
        </div>
      </div>
      <div className="flex-1 pb-8">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all glow group-hover:bg-white/[0.07]">
          <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{memory.type}</span>
             <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{formattedDate}</span>
          </div>
          <p className="text-zinc-200 leading-relaxed mb-4 line-clamp-3">{memory.content}</p>
          <div className="flex flex-wrap gap-2">
            {(memory.tags || ['ai-generated', 'processed']).map((tag: string) => (
              <span key={tag} className="px-2 py-1 rounded bg-zinc-800 text-[9px] font-bold uppercase tracking-tighter text-zinc-400 border border-white/5">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
