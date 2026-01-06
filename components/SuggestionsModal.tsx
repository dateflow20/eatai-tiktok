
import React, { useState, useRef } from 'react';
import { Suggestion, UserSettings } from '../types';
import { generateTTS, decodeAudio, decodeAudioData } from '../services/geminiService';

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: Suggestion[];
  onReplyUsed: (text: string) => void;
  onRegenerate: () => void;
  isLoading: boolean;
  activeSettings: UserSettings;
}

export const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ 
  isOpen, 
  onClose, 
  suggestions, 
  onReplyUsed, 
  onRegenerate,
  isLoading,
  activeSettings
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  if (!isOpen) return null;

  const handleCopyAndUse = (text: string, id: string, isMeta?: boolean) => {
    if (isMeta) return; 
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onReplyUsed(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const playAudio = async (suggestion: Suggestion) => {
    if (playingId) return;
    setPlayingId(suggestion.id);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const base64 = await generateTTS(suggestion.text, suggestion.vibe);
      const audioBytes = decodeAudio(base64);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setPlayingId(null);
      source.start();
    } catch (err) {
      console.error("TTS failed", err);
      setPlayingId(null);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Rapport': return 'bg-zinc-800 text-zinc-400 border-white/5';
      case 'Escalation': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Pivot': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'Closer': return 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]';
      case 'Checkpoint': return 'bg-amber-500 text-black border-amber-400';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl h-full md:h-[90vh] apple-glass rounded-none md:rounded-[3.5rem] border-0 md:border md:border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Header */}
        <div className="px-6 py-8 md:px-14 md:py-10 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">Suggestions</h2>
            <div className="flex items-center gap-3 mt-2">
               <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{suggestions.length} Ideas ready</span>
            </div>
          </div>
          <div className="flex gap-2 md:gap-4">
             <button 
              onClick={onRegenerate}
              disabled={isLoading}
              className="px-4 py-2.5 md:px-8 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
            >
              {isLoading ? '...' : 'Refresh'}
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 md:w-16 md:h-16 bg-white text-black rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-2xl"
            >
              <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Scrollable Body - Optimized for Mobile */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 bg-black/20">
          {suggestions.map((s) => (
            <div 
              key={s.id} 
              className={`apple-card rounded-[2rem] p-6 md:p-8 flex flex-col gap-4 md:gap-6 relative group border transition-all ${
                s.isMeta ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${getPhaseColor(s.phase)}`}>
                    {s.isMeta ? 'Ask them' : s.phase}
                  </span>
                  {!s.isMeta && (
                    <span className="px-3 py-1.5 bg-white/5 rounded-lg text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-white/5">
                      {s.vibe}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => playAudio(s)}
                  className={`w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all ${playingId === s.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-600 hover:text-white hover:border-indigo-500/30'}`}
                >
                  <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                </button>
              </div>
              
              <p className={`text-xl md:text-2xl font-semibold leading-snug tracking-tight ${s.isMeta ? 'text-amber-200 italic' : 'text-white'}`}>
                {s.text}
              </p>

              <div className="mt-auto pt-4 md:pt-8 border-t border-white/5 flex flex-col gap-4">
                {!s.isMeta && (
                  <p className="text-[9px] md:text-[11px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
                    {s.strategy}
                  </p>
                )}
                {s.isMeta ? (
                  <div className="py-4 px-6 bg-amber-500/20 rounded-xl border border-amber-500/30">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Feedback required</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleCopyAndUse(s.text, s.id, s.isMeta)}
                    className={`w-full py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 ${s.phase === 'Closer' ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-600/40' : 'bg-white text-black hover:bg-zinc-200 hover:shadow-white/20'}`}
                  >
                    Use reply
                  </button>
                )}
              </div>

              {copiedId === s.id && (
                <div className="absolute inset-0 bg-indigo-600/95 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center animate-in fade-in duration-300 z-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-indigo-600 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-2xl">
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-[0.4em]">Copied</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
