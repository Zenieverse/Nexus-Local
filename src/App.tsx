import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Database, 
  MessageSquare, 
  History, 
  Settings as SettingsIcon, 
  Search, 
  Cpu, 
  Waves, 
  User,
  Plus,
  ArrowRight,
  Code2,
  FileText,
  Mic,
  Camera,
  Activity,
  Command
} from 'lucide-react';
import { auth } from './lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { cn } from './lib/utils';

// View components
const Timeline = React.lazy(() => import('./components/Timeline'));
const Vault = React.lazy(() => import('./components/Vault'));
const Agents = React.lazy(() => import('./components/Agents'));
const Coding = React.lazy(() => import('./components/Coding'));
const Settings = React.lazy(() => import('./components/Settings'));

import { SettingsProvider } from './lib/context/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

function AppContent() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeView, setActiveView] = useState<'timeline' | 'vault' | 'agents' | 'coding' | 'settings'>('timeline');
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialAgentQuery, setInitialAgentQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setInitialAgentQuery(searchQuery);
    setActiveView('agents'); 
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#09090b]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary"
        >
          <Cpu size={48} className="text-white" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#09090b] text-white p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 glow">
              <Cpu size={64} className="text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter font-display">NEXUS LOCAL</h1>
            <p className="text-muted-foreground">Privacy-first Multimodal AI Operating System</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full py-4 px-6 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
          >
            Authenticate with Google
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Gemma 4 26B MoE Powered</p>
        </motion.div>
        
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 blur-[120px] rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-[#09090b] text-white overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-20 lg:w-64 border-r border-white/5 flex flex-col glass z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 text-white">
            <Cpu size={24} />
          </div>
          <span className="hidden lg:block font-bold tracking-tighter text-lg font-display">NEXUS LOCAL</span>
        </div>

        <div className="flex-1 px-4 py-8 space-y-2">
          <NavButton 
            active={activeView === 'timeline'} 
            onClick={() => setActiveView('timeline')}
            icon={<History size={20} />}
            label="Memory Timeline"
          />
          <NavButton 
            active={activeView === 'vault'} 
            onClick={() => setActiveView('vault')}
            icon={<Database size={20} />}
            label="Knowledge Vault"
          />
          <NavButton 
            active={activeView === 'agents'} 
            onClick={() => setActiveView('agents')}
            icon={<MessageSquare size={20} />}
            label="AI Agents"
          />
          <NavButton 
            active={activeView === 'coding'} 
            onClick={() => setActiveView('coding')}
            icon={<Code2 size={20} />}
            label="Coding Engine"
          />
        </div>

        <div className="p-4 space-y-2 border-t border-white/5">
           <NavButton 
            active={activeView === 'settings'} 
            onClick={() => setActiveView('settings')}
            icon={<SettingsIcon size={20} />}
            label="System Settings"
          />
           <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/20 to-white/5 flex items-center justify-center border border-white/10 shrink-0">
               {user.photoURL ? <img src={user.photoURL} className="rounded-full" /> : <User size={16} />}
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-xs font-semibold truncate">{user.displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">Authorized</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 glass shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-2xl px-4 py-2 rounded-full bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsSearchOpen(true)}>
            <Search size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search semantic memory...</span>
            <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground bg-white/10 px-1.5 py-0.5 rounded border border-white/5 uppercase font-mono">
              <Command size={10} />
              <span>K</span>
            </div>
          </div>

          <div className="flex items-center gap-6 ml-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Local Core Active</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground shrink-0">
              <Activity size={18} className="hover:text-white transition-colors cursor-pointer" />
              <Waves size={18} className="hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <React.Suspense fallback={<ViewLoader />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {activeView === 'timeline' && <Timeline />}
                {activeView === 'vault' && <Vault />}
                {activeView === 'agents' && <Agents initialQuery={initialAgentQuery} onClearQuery={() => setInitialAgentQuery('')} />}
                {activeView === 'coding' && <Coding />}
                {activeView === 'settings' && <Settings />}
              </motion.div>
            </AnimatePresence>
          </React.Suspense>
        </div>
      </main>

      {/* Floating Action Menu (Quick Tools) */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        <ActionButton icon={<Mic />} label="Voice" />
        <ActionButton icon={<Plus />} label="New Task" primary onClick={() => setActiveView('agents')} />
      </div>

      {/* Command Palette Mockup */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="p-4 flex items-center gap-4 border-b border-white/5">
                <Search className="text-muted-foreground" size={20} />
                <input 
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Ask NEXUS anything..."
                  className="bg-transparent border-none outline-none flex-1 text-lg text-white"
                />
              </form>
              <div className="p-2 h-96 overflow-y-auto">
                <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Intelligence Search</div>
                {searchQuery.length > 0 ? (
                  <div className="space-y-1">
                    <SearchResult 
                      icon={<Brain size={14} />} 
                      text={`Synthesize knowledge on: ${searchQuery}`} 
                      onClick={() => handleSearch({ preventDefault: () => {} } as any)}
                    />
                    <SearchResult 
                      icon={<Search size={14} />} 
                      text={`Find "${searchQuery}" in Knowledge Vault`} 
                      onClick={() => { setActiveView('vault'); setIsSearchOpen(false); }}
                    />
                    <SearchResult 
                      icon={<History size={14} />} 
                      text={`Recall interactions related to "${searchQuery}"`} 
                      onClick={() => { setActiveView('timeline'); setIsSearchOpen(false); }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Context</div>
                    <SearchResult icon={<History />} text="Recall last Tuesday's startup ideas" onClick={() => { setSearchQuery("Tuesday startup ideas"); }} />
                    <SearchResult icon={<FileText />} text="Synthesize Kubernetes PDF notes" onClick={() => { setSearchQuery("Synthesize Kubernetes PDF"); }} />
                    <SearchResult icon={<MessageSquare />} text="Ask Research Agent about Quantum Computing" onClick={() => { setSearchQuery("Quantum Computing info"); }} />
                    <SearchResult icon={<Code2 />} text="Analyze current repository architecture" onClick={() => { setActiveView('coding'); setIsSearchOpen(false); }} />
                  </>
                )}
              </div>
              <div className="p-3 bg-zinc-950 border-t border-white/5 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
                <span>Select Item: Enter</span>
                <div className="flex gap-4">
                   <span>Navigate: &uarr;&darr;</span>
                   <span>Close: Esc</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative",
        active ? "bg-white/10 text-white shadow-lg glow" : "text-muted-foreground hover:bg-white/5 hover:text-white"
      )}
    >
      <div className={cn("shrink-0", active ? "text-white" : "text-muted-foreground group-hover:text-white")}>
        {icon}
      </div>
      <span className={cn("hidden lg:block text-sm font-medium", active ? "opacity-100" : "opacity-70 group-hover:opacity-100")}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="sidebar-accent"
          className="absolute left-0 w-1 h-6 bg-white rounded-full lg:hidden"
        />
      )}
    </button>
  );
}

function ActionButton({ icon, label, primary = false, onClick }: { icon: React.ReactNode, label?: string, primary?: boolean, onClick?: () => void }) {
  return (
    <motion.button 
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border transition-all",
        primary 
          ? "bg-white text-black border-white hover:bg-zinc-200" 
          : "bg-zinc-800 text-white border-white/10 hover:bg-zinc-700"
      )}
    >
      {icon}
    </motion.button>
  );
}

function SearchResult({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors">
      <div className="p-2 rounded-lg bg-zinc-800 text-muted-foreground group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-zinc-300 group-hover:text-white">{text}</span>
      <ArrowRight size={14} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </div>
  );
}

function ViewLoader() {
  return (
    <div className="h-full flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Activity size={32} className="text-muted-foreground" />
      </motion.div>
    </div>
  );
}
