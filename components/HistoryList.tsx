
import React from 'react';
import { Conversation } from '../types';

interface HistoryListProps {
  history: Conversation[];
  onSelect: (conv: Conversation) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  activeId?: string;
}

export const HistoryList: React.FC<HistoryListProps> = ({ 
  history, 
  onSelect, 
  onDelete, 
  onClearAll,
  activeId 
}) => {
  if (history.length === 0) return null;

  return (
    <div className="apple-glass rounded-[2rem] p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Archive</h3>
        <button 
          onClick={onClearAll}
          className="text-[10px] font-black text-zinc-600 hover:text-red-400 uppercase tracking-tighter transition-colors"
        >
          Wipe All
        </button>
      </div>
      
      <div className="flex flex-col gap-3 max-h-[440px] overflow-y-auto pr-3 custom-scrollbar">
        {history.sort((a, b) => b.timestamp - a.timestamp).map((conv) => (
          <div 
            key={conv.id}
            className={`group relative flex flex-col gap-2 p-5 rounded-[1.5rem] cursor-pointer transition-all border apple-card ${
              activeId === conv.id 
                ? 'bg-zinc-800 border-indigo-500/30 shadow-lg' 
                : 'bg-zinc-900/50 border-transparent hover:bg-zinc-800'
            }`}
            onClick={() => onSelect(conv)}
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                {conv.settings.currentVibe} • {new Date(conv.timestamp).toLocaleDateString()}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
            <p className="text-xs font-semibold text-zinc-300 truncate">
              {conv.context.thread && conv.context.thread.length > 0 
                ? conv.context.thread[conv.context.thread.length - 1].text 
                : (conv.context.imageBase64 ? "Media Context" : "Initiated Analysis")}
            </p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest truncate">
              {conv.settings.goal}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
