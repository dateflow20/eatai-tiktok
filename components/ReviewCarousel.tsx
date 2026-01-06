
import React, { useState } from 'react';
import { SocialReview } from '../types';

interface ReviewCarouselProps {
  review: SocialReview;
  onClose: () => void;
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ review, onClose }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "The Vibe Check",
      subtitle: "Current Atmosphere",
      bg: "from-indigo-600 to-blue-700",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="text-7xl mb-6">🎭</div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">{review.mood}</h2>
          <p className="text-indigo-100 text-lg font-medium opacity-80">
            This is the current energy of your conversation.
          </p>
        </div>
      )
    },
    {
      title: "Sync Level",
      subtitle: "Alignment Score",
      bg: "from-fuchsia-600 to-purple-700",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
             <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="transparent" />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="white"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={552.92}
                strokeDashoffset={552.92 - (552.92 * review.syncScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-6xl font-black text-white">{review.syncScore}%</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Social Connection</h2>
          <p className="text-purple-100 text-lg opacity-80">Your logic is perfectly mapped to their responses.</p>
        </div>
      )
    },
    {
      title: "Playbook",
      subtitle: "Strategic Highlights",
      bg: "from-orange-500 to-rose-600",
      content: (
        <div className="flex flex-col gap-6 items-start h-full justify-center px-8">
          {review.highlights.map((h, i) => (
            <div key={i} className="flex gap-4 items-center animate-in slide-in-from-left duration-500" style={{ delay: `${i * 150}ms` }}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-lg">
                {i + 1}
              </div>
              <p className="text-xl font-bold text-white leading-tight">{h}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Master Move",
      subtitle: "Executive Summary",
      bg: "from-emerald-500 to-teal-700",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
           <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center text-white text-4xl mb-8 backdrop-blur-md">
            🎯
          </div>
          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">Commander's Intent</h2>
          <p className="text-xl font-medium text-white leading-relaxed italic">
            "{review.strategicAdvice}"
          </p>
          <div className="mt-10 px-6 py-2 bg-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
            Standing: {review.relationshipStatus}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black animate-in fade-in duration-300">
      <div className="relative w-full max-w-[430px] h-[90vh] max-h-[850px] bg-zinc-950 rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] flex flex-col border border-white/10">
        
        {/* Progress Bars */}
        <div className="absolute top-6 left-6 right-6 z-20 flex gap-1.5">
          {slides.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-white transition-all duration-[3000ms] linear ${i < activeSlide ? 'w-full opacity-100' : i === activeSlide ? 'w-full' : 'w-0'}`}
              />
            </div>
          ))}
        </div>

        {/* Header Overlay */}
        <div className="absolute top-12 left-8 right-8 z-20 flex justify-between items-center text-white">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{slides[activeSlide].subtitle}</span>
            <span className="text-sm font-black uppercase tracking-widest">{slides[activeSlide].title}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content Slides */}
        <div className={`flex-1 transition-all duration-700 bg-gradient-to-br ${slides[activeSlide].bg}`}>
           {slides[activeSlide].content}
        </div>

        {/* Navigation Areas (Touch/Click) */}
        <div className="absolute inset-0 flex z-10">
          <div className="flex-1 cursor-w-resize" onClick={() => activeSlide > 0 && setActiveSlide(s => s - 1)}></div>
          <div className="flex-1 cursor-e-resize" onClick={() => activeSlide < slides.length - 1 ? setActiveSlide(s => s + 1) : onClose()}></div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-10 left-0 right-0 z-20 flex flex-col items-center gap-4">
          <button 
            onClick={onClose}
            className="px-12 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            End Review
          </button>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Tap right to continue • Tap left to go back</span>
        </div>
      </div>
    </div>
  );
};
