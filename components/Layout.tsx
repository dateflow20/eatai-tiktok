
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onShowDocs?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onShowDocs }) => {
  return (
    <div className="min-h-screen flex flex-col items-center selection:bg-indigo-500/40">
      <header className="w-full sticky top-0 z-[100] px-6 md:px-12 py-6 flex justify-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-full max-w-6xl flex justify-between items-center apple-glass px-8 py-4 rounded-[2rem]">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 bg-white rounded-[1.25rem] flex items-center justify-center text-black font-black text-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">R</div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white leading-none font-outfit">Reply</h1>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Social Architect</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-10 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
              <button onClick={onShowDocs} className="hover:text-white transition-colors hover:scale-105 active:scale-95">Specs</button>
            </nav>
          </div>
        </div>
      </header>
      <main className="w-full max-w-6xl flex flex-col gap-10 pb-32 px-6 md:px-12 mt-10">
        {children}
      </main>
    </div>
  );
};
