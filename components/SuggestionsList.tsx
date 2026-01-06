
import React, { useState, useRef } from 'react';
import { Suggestion } from '../types';
import { generateTTS, decodeAudio, decodeAudioData } from '../services/geminiService';

interface SuggestionsListProps {
  suggestions: Suggestion[];
  onReplyUsed: (text: string) => void;
  onRegenerate: () => void;
  onRate: (id: string, rating: number) => void;
  isLoading: boolean;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({ 
  suggestions, 
  onReplyUsed, 
  onRegenerate,
  onRate,
  isLoading 
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleCopyAndUse = (text: string, id: string, isMeta?: boolean) => {
    if (isMeta) return; // Don't copy meta-questions
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onReplyUsed(text);
    setTimeout(() => setCopiedId(null), 2000);
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
      case 'Closer': return 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse';
      case 'Checkpoint': return 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 apple-glass rounded-[2.5rem] p-6 md:p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 mb-4 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Logic Threads</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Incremental Building • Phase Control</p>
        </div>
        <button 
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          )}
          Recalculate Moves
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {suggestions.map((s) => (
          <div 
            key={s.id} 
            className={`apple-card rounded-[1.75rem] p-6 flex flex-col gap-4 relative group border transition-all hover:translate-y-[-2px] ${
              s.isMeta ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 hover:border-indigo-500/30'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getPhaseColor(s.phase)}`}>
                  {s.isMeta ? 'STRATEGY CHECK' : s.phase}
                </span>
                <span className="px-2.5 py-1 bg-white/5 rounded-lg text-[8px] font-black text-zinc-500 uppercase tracking-widest border border-white/5">
                  {s.vibe}
                </span>
              </div>
              <button 
                onClick={() => playAudio(s)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${playingId === s.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-600 hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
              </button>
            </div>
            
            <p className={`text-[15px] font-medium leading-snug tracking-tight ${s.isMeta ? 'text-amber-200 italic' : 'text-white'}`}>
              {s.text}
            </p>

            <div className="flex flex-col gap-3 mt-auto">
              {!s.isMeta && (
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">
                  Intent: {s.strategy}
                </p>
              )}
              {s.isMeta ? (
                <div className="flex items-center gap-2 py-3 px-4 bg-amber-500/20 rounded-xl">
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Decision Point Required</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleCopyAndUse(s.text, s.id, s.isMeta)}
                  className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-sm ${s.phase === 'Closer' ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white text-black hover:bg-zinc-200'}`}
                >
                  Execute Move
                </button>
              )}
            </div>

            {copiedId === s.id && (
              <div className="absolute inset-0 bg-indigo-600/95 backdrop-blur-sm rounded-[1.75rem] flex items-center justify-center animate-in fade-in duration-200 z-10">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Strategy Deployed</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
