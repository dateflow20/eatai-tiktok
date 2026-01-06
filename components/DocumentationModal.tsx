
import React from 'react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl h-[85vh] apple-glass rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="p-8 md:p-12 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">Lab Specs</h2>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Neural Logic Documentation</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-2xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-14 space-y-12">
          <section className="space-y-6">
            <h3 className="text-xl font-black text-indigo-500 uppercase tracking-widest">01. AI Persona</h3>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Reply is a world-class Social Architect. It doesn't just "talk"—it builds bridges. By analyzing social distance and dialogue velocity, it emulates human behavior to achieve your goals with 100% precision.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black text-indigo-500 uppercase tracking-widest">02. Strategic Phases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Rapport', desc: 'Building comfort and matching frequency.' },
                { name: 'Escalation', desc: 'Increasing intensity and social risk.' },
                { name: 'Pivot', desc: 'Changing lanes when momentum stalls.' },
                { name: 'Closer', desc: 'The final move to secure the win.' }
              ].map(phase => (
                <div key={phase.name} className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                  <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2">{phase.name}</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">{phase.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black text-indigo-500 uppercase tracking-widest">03. Linguistic Engine</h3>
            <p className="text-zinc-400 text-base leading-relaxed">
              We leverage <span className="text-white font-bold">Gemini 3 Flash</span> for real-time inference. The engine is trained to understand <span className="text-white italic">Luglish</span> (English/Luganda hybrid) and local slang, ensuring your replies never sound robotic.
            </p>
            <div className="bg-indigo-600/10 p-6 rounded-2xl border border-indigo-500/20">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Technical Rule</span>
               <code className="text-xs text-indigo-200">System.Constraint.Brevity = 12_Words_MAX</code>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black text-indigo-500 uppercase tracking-widest">04. Audio Emulation</h3>
            <p className="text-zinc-400 text-base leading-relaxed">
              Using <span className="text-white font-bold">Gemini 2.5 TTS</span>, we generate neural audio samples for every suggestion. This helps you "hear" the vibe before you send the text.
            </p>
          </section>
        </div>

        <div className="p-8 bg-zinc-950/50 border-t border-white/5 text-center">
           <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">Reply Neural Systems v1.0.4</span>
        </div>
      </div>
    </div>
  );
};
