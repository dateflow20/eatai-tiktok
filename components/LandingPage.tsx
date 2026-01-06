
import React, { useState } from 'react';
import { AuthModal } from './AuthModal';

interface LandingPageProps {
  onEnter: () => void;
}

const AnimatedLetter: React.FC<{ char: string; index: number; baseDelay?: number }> = ({ char, index, baseDelay = 0.1 }) => {
  return (
    <span
      className="flowing-letter"
      style={{
        animationDelay: `${index * baseDelay}s`,
        display: char === ' ' ? 'inline' : 'inline-block',
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
};

const AnimatedText: React.FC<{ text: string; className?: string; baseDelay?: number }> = ({ text, className, baseDelay = 0.05 }) => {
  return (
    <div className={className}>
      {text.split('').map((char, i) => (
        <AnimatedLetter key={i} char={char} index={i} baseDelay={baseDelay} />
      ))}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/50 flex flex-col items-center justify-center overflow-hidden relative">
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-violet-600/10 blur-[150px] rounded-full animate-pulse delay-1000 pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-fuchsia-600/5 blur-[100px] rounded-full animate-pulse delay-500 pointer-events-none"></div>

      {/* Hero Content */}
      <main className="relative z-10 w-full max-w-6xl px-8 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-black font-black text-5xl mb-16 shadow-[0_0_80px_rgba(255,255,255,0.2)] animate-in zoom-in-50 duration-1000 rotate-3 hover:rotate-0 transition-transform cursor-pointer group">
          <span className="group-hover:scale-110 transition-transform">R</span>
        </div>

        <div className="flex flex-col gap-4 mb-20 leading-tight select-none">
          <AnimatedText
            text="Get any"
            className="text-6xl md:text-8xl font-black tracking-tighter font-outfit"
            baseDelay={0.03}
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <AnimatedText
              text="Girl. Job."
              className="text-7xl md:text-[9rem] font-black tracking-tighter neural-gradient font-outfit"
              baseDelay={0.08}
            />
            <AnimatedText
              text="Boy. Date."
              className="text-7xl md:text-[9rem] font-black tracking-tighter neural-gradient font-outfit"
              baseDelay={0.09}
            />
          </div>
          <AnimatedText
            text="...Anything."
            className="text-5xl md:text-7xl font-black tracking-tighter mt-6 font-outfit"
            baseDelay={0.05}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8 animate-in slide-in-from-bottom-14 duration-1000 delay-700 fill-mode-both">
          <button
            onClick={() => setShowAuth(true)}
            className="px-20 py-8 bg-white text-black rounded-[2.5rem] font-black text-base uppercase tracking-[0.4em] shadow-[0_20px_100px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95 transition-all flex items-center gap-8 group shimmer"
          >
            Sign In
            <svg className="w-6 h-6 transition-transform group-hover:translate-x-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            onClick={onEnter}
            className="px-14 py-8 bg-zinc-900/50 backdrop-blur-md text-zinc-400 border border-white/5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] hover:text-white hover:bg-zinc-800 transition-all hover:border-white/10"
          >
            Continue as Guest
          </button>
        </div>

        <div className="mt-20 flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-1000">
          <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.6em]">
            Architecture for Social Victory
          </p>
          <div className="w-px h-12 bg-gradient-to-b from-indigo-500/50 to-transparent"></div>
        </div>
      </main>

      {/* Subtle Floating Background Icons */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden select-none">
        <span className="absolute top-[10%] left-[5%] text-[25rem] font-black animate-pulse font-outfit">G</span>
        <span className="absolute bottom-[15%] right-[5%] text-[20rem] font-black animate-pulse delay-500 font-outfit">J</span>
        <span className="absolute top-[40%] right-[10%] text-[15rem] font-black animate-pulse delay-700 text-indigo-500 font-outfit">B</span>
        <span className="absolute bottom-[5%] left-[20%] text-[18rem] font-black animate-pulse delay-300 font-outfit">D</span>
      </div>
    </div>
  );
};
