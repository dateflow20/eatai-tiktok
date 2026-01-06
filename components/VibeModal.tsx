
import React, { useState } from 'react';
import { VIBE_OPTIONS } from '../constants';

interface VibeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVibe: string;
  onSelectVibe: (vibe: string) => void;
  customVibes: string[];
  onAddCustomVibe: (vibe: string) => void;
}

export const VibeModal: React.FC<VibeModalProps> = ({ 
  isOpen, 
  onClose, 
  currentVibe, 
  onSelectVibe,
  customVibes,
  onAddCustomVibe
}) => {
  const [newVibe, setNewVibe] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newVibe.trim()) {
      onAddCustomVibe(newVibe.trim());
      onSelectVibe(newVibe.trim());
      setNewVibe('');
      setShowAddInput(false);
    }
  };

  const findIcon = (name: string) => {
    return VIBE_OPTIONS.find(v => v.name === name)?.icon || '✨';
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl apple-glass rounded-[2.5rem] p-10 shadow-2xl border border-white/10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black text-white tracking-tight">Select Vibe</h2>
              <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="text-xl">{findIcon(currentVibe)}</span>
                <span className="text-[10px] font-black uppercase text-white tracking-widest">{currentVibe}</span>
              </div>
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Adjust your neural frequency</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar mb-4">
          {VIBE_OPTIONS.map((v) => (
            <button
              key={v.name}
              onClick={() => { onSelectVibe(v.name); }}
              className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all border apple-card ${
                currentVibe === v.name 
                ? 'bg-white shadow-[0_0_25px_rgba(255,255,255,0.2)] border-white scale-105' 
                : 'bg-zinc-900/50 border-transparent hover:border-white/20'
              }`}
            >
              <span className="text-3xl">{v.icon}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest text-center ${currentVibe === v.name ? 'text-black' : 'text-zinc-500'}`}>
                {v.name}
              </span>
            </button>
          ))}
          
          {customVibes.map((cv) => (
            <button
              key={cv}
              onClick={() => { onSelectVibe(cv); }}
              className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all border apple-card ${
                currentVibe === cv 
                ? 'bg-indigo-600 shadow-[0_0_25px_rgba(79,70,229,0.3)] border-indigo-400 scale-105' 
                : 'bg-zinc-900/50 border-transparent hover:border-indigo-500/30'
              }`}
            >
              <span className="text-3xl">✨</span>
              <span className={`text-[10px] font-black uppercase tracking-widest text-center ${currentVibe === cv ? 'text-white' : 'text-zinc-500'}`}>
                {cv}
              </span>
            </button>
          ))}

          <button
            onClick={() => setShowAddInput(true)}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-3xl border border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:scale-125 transition-transform group-hover:bg-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white">New Vibe</span>
          </button>
        </div>

        {showAddInput && (
          <div className="mt-6 flex gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex-1 relative group">
              <input 
                autoFocus
                type="text"
                value={newVibe}
                onChange={(e) => setNewVibe(e.target.value)}
                placeholder="Name your custom vibe..."
                className="w-full bg-zinc-800/80 border border-white/10 text-white rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <button 
              onClick={handleAdd}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Save
            </button>
            <button 
              onClick={() => setShowAddInput(false)}
              className="px-4 py-4 bg-white/5 text-zinc-500 rounded-2xl font-black text-xs uppercase hover:text-white transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
