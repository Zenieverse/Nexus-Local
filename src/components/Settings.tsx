import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Shield, Zap, Activity, HardDrive, Database, Globe, Lock, Cpu as Chip, Settings as SettingsIcon, CheckCircle2 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useSettings } from '../lib/context/SettingsContext';

export default function Settings() {
  const { settings, updateSetting, purgeMemories } = useSettings();
  const [purging, setPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [vramUsage, setVramUsage] = useState(5.2);

  // Simulated metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setVramUsage(Number((4.5 + Math.random() * 1.5).toFixed(1)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePurge = async () => {
    setPurging(true);
    await purgeMemories();
    await new Promise(r => setTimeout(r, 2000));
    setPurging(false);
    setPurgeSuccess(true);
    setTimeout(() => setPurgeSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <h2 className="text-3xl font-bold tracking-tight font-display">System Settings</h2>
        <p className="text-muted-foreground">Manage your local intelligence core and privacy parameters.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hardware & Inference */}
        <div className="space-y-6">
          <SectionHeader icon={<Chip size={18} />} title="Compute Intelligence" />
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
            <StatusRow label="Primary Model" value="Gemma 4 26B MoE" status="Active" />
            <StatusRow label="Expert Chains" value="8/8 Experts Online" status="Optimized" />
            <StatusRow label="Quantization" value="4-bit Precision" status="Normal" />
            
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">GPU Acceleration</p>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '64%' }}
                  animate={{ width: `${(vramUsage / 8) * 100}%` }}
                  className="h-full bg-white glow"
                />
              </div>
              <div className="flex justify-between mt-2 font-mono text-[10px] text-zinc-500">
                <span>VRAM: {vramUsage}GB / 8GB</span>
                <span>{Math.round((vramUsage / 8) * 100)}% Utilization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Neural Vault */}
        <div className="space-y-6">
          <SectionHeader icon={<Database size={18} />} title="Neural Vault" />
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
            <StatusRow label="Embeddings Engine" value="Gemma 2B Vector" status="Active" />
            <StatusRow label="Local Memory" value="1.24 GB Used" status="Low" />
            <StatusRow label="Sync Status" value={settings.offlineMode ? "Local-Only (Airbagged)" : "Cloud Sync Active"} status="Secured" />

             <div className="pt-4 border-t border-white/5 space-y-3">
               <button 
                 onClick={handlePurge}
                 disabled={purging}
                 className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-50"
               >
                 {purging ? "Purging..." : "Purge Semantic Index"}
               </button>
               <AnimatePresence>
                 {purgeSuccess && (
                   <motion.div 
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest text-center flex items-center justify-center gap-1"
                   >
                     <CheckCircle2 size={10} /> Index Purged
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="space-y-6">
          <SectionHeader icon={<Shield size={18} />} title="Privacy Guard" />
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
             <Toggle 
               label="Offline Priority Mode" 
               description="Force all compute to stay on local silicon regardless of task complexity." 
               active={settings.offlineMode}
               onToggle={() => updateSetting('offlineMode', !settings.offlineMode)}
             />
             <Toggle 
               label="Episodic Forgetting" 
               description="Automatically clear conversation history after 24 hours." 
               active={settings.episodicForgetting}
               onToggle={() => updateSetting('episodicForgetting', !settings.episodicForgetting)}
             />
             <Toggle 
               label="Encrypted Retrieval" 
               description="Encrypt vector memory at rest with hardware-backed keys." 
               active={settings.encryptedRetrieval}
               onToggle={() => updateSetting('encryptedRetrieval', !settings.encryptedRetrieval)}
             />
          </div>
        </div>

        {/* Network & Agents */}
        <div className="space-y-6">
          <SectionHeader icon={<Globe size={18} />} title="Agent Network" />
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
             <Toggle 
               label="Autonomous Tool Calling" 
               description="Allow agents to execute local scripts and browser automation." 
               active={settings.autonomousTools}
               onToggle={() => updateSetting('autonomousTools', !settings.autonomousTools)}
             />
             <Toggle 
               label="Cloud Augmentation" 
               description="Optionally route extremely legacy tasks to cloud models." 
               active={settings.cloudAugmentation}
               onToggle={() => updateSetting('cloudAugmentation', !settings.cloudAugmentation)}
             />
             <div className="pt-2">
               <button className="text-xs text-zinc-400 hover:text-white underline underline-offset-4">Configure External Integrations</button>
             </div>
          </div>
        </div>
      </div>

      <footer className="pt-12 border-t border-white/5 flex flex-col items-center gap-4 text-center">
        <Cpu size={32} className="text-white opacity-20" />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nexus Local v1.0.0-PROD</p>
          <p className="text-[10px] text-zinc-600 font-mono mt-1">BUILD: 2026.05.18.ALPHA-RETAIL</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground">
        {icon}
      </div>
      <h3 className="font-bold uppercase tracking-widest text-xs">{title}</h3>
    </div>
  );
}

function StatusRow({ label, value, status }: { label: string, value: string, status: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-emerald-500">
        {status}
      </span>
    </div>
  );
}

function Toggle({ label, description, active = false, onToggle }: { label: string, description: string, active?: boolean, onToggle?: () => void }) {
  return (
    <div className="flex items-center gap-6 justify-between group">
      <div className="flex-1">
        <p className="text-sm font-medium group-hover:text-white transition-colors">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-white' : 'bg-white/10'}`}
      >
        <motion.div 
          animate={{ x: active ? 22 : 2 }}
          className={`absolute top-1 w-3 h-3 rounded-full ${active ? 'bg-black' : 'bg-zinc-500'}`}
        />
      </button>
    </div>
  );
}
