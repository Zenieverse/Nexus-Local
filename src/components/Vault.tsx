import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, File, X, CheckCircle2, Shield, Zap, Search, Database, Plus, Waves } from 'lucide-react';
import { auth } from '../lib/firebase';
import { MemoryService } from '../lib/services';
import { cn } from '../lib/utils';

export default function Vault() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'text/markdown': ['.md'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  } as any);

  const removeFile = (name: string) => {
    setFiles(files.filter(f => f.name !== name));
  };

  const handleIngest = async () => {
    if (files.length === 0 || !auth.currentUser) return;
    setUploading(true);
    
    // In a real app, we'd upload to Storage + process with AI
    // Here we simulate the AI ingestion into memories
    for (const file of files) {
      await MemoryService.addMemory(
        auth.currentUser.uid,
        `Processed file: ${file.name}. Size: ${(file.size / 1024).toFixed(2)}KB. Type: ${file.type}`,
        'file',
        { fileName: file.name, fileSize: file.size }
      );
      // Simulate processing delay
      await new Promise(r => setTimeout(r, 1000));
    }

    setUploading(false);
    setSuccess(true);
    setFiles([]);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Knowledge Vault</h2>
          <p className="text-muted-foreground">Ingest documents, images, and code for local synthesis.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Storage Status</p>
              <p className="text-xs font-mono">1.2 GB / 10 GB</p>
           </div>
           <div className="w-12 h-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center">
              <Shield size={20} className="text-zinc-400" />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div 
            {...getRootProps()} 
            className={cn(
              "border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4",
              isDragActive ? "border-white bg-white/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
            )}
          >
            <input {...getInputProps()} />
            <div className="p-4 rounded-full bg-white/5 border border-white/10 glow">
              <Upload size={32} className={cn("transition-transform", isDragActive && "scale-110")} />
            </div>
            <div>
              <p className="text-lg font-medium">Drag & Drop knowledge</p>
              <p className="text-sm text-muted-foreground">PDFs, Docs, Images, or Repositories</p>
            </div>
            <button className="px-6 py-2 bg-white text-black rounded-lg text-sm font-bold mt-4">
              Select Files
            </button>
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 bg-white/5 border border-white/10 rounded-3xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold uppercase tracking-widest text-xs">Queue ({files.length})</h3>
                  <button onClick={() => setFiles([])} className="text-xs text-muted-foreground hover:text-white transition-colors">Clear All</button>
                </div>
                {files.map(file => (
                  <div key={file.name} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 group">
                    <File size={18} className="text-muted-foreground" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button onClick={() => removeFile(file.name)} className="p-1 hover:bg-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button 
                  disabled={uploading}
                  onClick={handleIngest}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Zap className="animate-spin" size={18} />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Commit to Memory
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
           <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 glow">
              <h3 className="font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <Database size={14} /> Processed Index
              </h3>
              <div className="space-y-4">
                 <IndexStat label="Documents" value="142" />
                 <IndexStat label="Images" value="89" />
                 <IndexStat label="Conversations" value="1,024" />
                 <IndexStat label="Code Snippets" value="56" />
              </div>
              <div className="pt-4 border-t border-white/5 overflow-hidden">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Recent Logic Map</p>
                 <div className="h-24 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
                    <Waves className="text-white/10 scale-150 rotate-12" />
                 </div>
              </div>
           </div>

           <AnimatePresence>
             {success && (
               <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-3"
               >
                 <CheckCircle2 size={18} />
                 <span className="text-sm font-medium">Memory committed successfully.</span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function IndexStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 text-sm">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
