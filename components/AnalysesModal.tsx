
import React from 'react';
import { Conversation, SocialReview } from '../types';

interface AnalysesModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: Conversation[];
}

export const AnalysesModal: React.FC<AnalysesModalProps> = ({ isOpen, onClose, history }) => {
    if (!isOpen) return null;

    const reviews = history
        .map(c => c.review)
        .filter((r): r is SocialReview => !!r);

    const avgSyncScore = reviews.length > 0
        ? Math.round(reviews.reduce((acc, r) => acc + r.syncScore, 0) / reviews.length)
        : 0;

    const moodCounts = reviews.reduce((acc, r) => {
        acc[r.mood] = (acc[r.mood] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topMoods = Object.entries(moodCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3);

    const relationshipStatuses = Array.from(new Set(reviews.map(r => r.relationshipStatus)));

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose}></div>

            <div className="relative w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700 flex flex-col max-h-[90vh]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600"></div>

                <div className="p-10 md:p-14 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-16">
                        <div>
                            <h2 className="text-5xl font-black text-white tracking-tighter font-outfit">Neural <span className="neural-gradient">Intelligence</span></h2>
                            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em] mt-4">Aggregated Social Metrics</p>
                        </div>
                        <button onClick={onClose} className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all group">
                            <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="py-32 flex flex-col items-center justify-center text-center gap-8">
                            <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center text-4xl border border-white/5 shadow-2xl animate-pulse">📊</div>
                            <h3 className="text-3xl font-black text-white font-outfit">No Data Available</h3>
                            <p className="text-zinc-500 max-w-xs font-medium leading-relaxed">Complete at least one "Check Momentum" analysis to see your social metrics here.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                <div className="apple-card p-10 rounded-[2.5rem] flex flex-col items-center text-center group">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-6">Avg Momentum</span>
                                    <div className="text-7xl font-black text-indigo-500 font-outfit group-hover:scale-110 transition-transform">{avgSyncScore}%</div>
                                    <div className="w-full h-1.5 bg-zinc-900 rounded-full mt-8 overflow-hidden">
                                        <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${avgSyncScore}%` }}></div>
                                    </div>
                                </div>

                                <div className="apple-card p-10 rounded-[2.5rem] flex flex-col items-center text-center group">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-6">Total Threads</span>
                                    <div className="text-7xl font-black text-white font-outfit group-hover:scale-110 transition-transform">{history.length}</div>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-8">Neural Contexts Mapped</p>
                                </div>

                                <div className="apple-card p-10 rounded-[2.5rem] flex flex-col items-center text-center group">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-6">Dominant Vibe</span>
                                    <div className="text-4xl font-black text-violet-400 font-outfit group-hover:scale-110 transition-transform uppercase tracking-tighter">
                                        {topMoods[0]?.[0] || 'N/A'}
                                    </div>
                                    <div className="flex gap-2 mt-8">
                                        {topMoods.map(([mood], i) => (
                                            <span key={i} className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-[9px] font-black text-violet-400 uppercase tracking-widest">
                                                {mood}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-8 space-y-10">
                                    <div className="apple-card p-10 rounded-[3rem]">
                                        <h3 className="text-xl font-black text-white mb-10 tracking-tight font-outfit uppercase tracking-[0.2em]">Strategic insights Archive</h3>
                                        <div className="space-y-6">
                                            {reviews.slice(0, 5).map((r, i) => (
                                                <div key={i} className="bg-white/5 border border-white/5 rounded-[1.5rem] p-8 hover:bg-white/[0.08] transition-all group/item">
                                                    <p className="text-zinc-300 text-base font-medium italic leading-relaxed group-hover/item:text-white transition-colors">"{r.strategicAdvice}"</p>
                                                    <div className="mt-6 flex items-center gap-6">
                                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{r.mood}</span>
                                                        <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
                                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Sync: {r.syncScore}%</span>
                                                        <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
                                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{r.relationshipStatus}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-4 space-y-10">
                                    <div className="apple-card p-10 rounded-[3rem] flex flex-col justify-center items-center text-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        <div className="relative z-10">
                                            <div className="w-20 h-20 bg-indigo-600/20 rounded-[1.5rem] flex items-center justify-center text-indigo-500 mb-8 mx-auto shadow-2xl">
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                            <h3 className="text-2xl font-black text-white mb-4 tracking-tight font-outfit">Strategic Insight</h3>
                                            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                                                {avgSyncScore > 70
                                                    ? "Your social momentum is peak. Maintain current calibration for maximum conversion."
                                                    : "Neural sync is fluctuating. Focus on mirroring and high-value emotional anchors."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="apple-card p-10 rounded-[3rem]">
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-8">Relationship Standing</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {relationshipStatuses.map(status => (
                                                <span key={status} className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20 transition-all cursor-default">
                                                    {status}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-10 bg-zinc-950/50 border-t border-white/5 text-center">
                    <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.6em]">Neural Analysis Engine v1.2.0</span>
                </div>
            </div>
        </div>
    );
};
