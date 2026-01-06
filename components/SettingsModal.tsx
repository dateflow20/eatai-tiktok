
import React, { useState, useRef } from 'react';
import { UserSettings, Vibe, Gender, Relationship } from '../types';
import { VIBE_OPTIONS, GENDERS, RELATIONSHIPS, GOAL_TEMPLATES } from '../constants';
import { VibeModal } from './VibeModal.tsx';
import { refineSituation } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onFinalize: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, setSettings, onFinalize }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isVibeModalOpen, setIsVibeModalOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [customVibes, setCustomVibes] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  if (!isOpen) return null;

  const handleChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const topVibes = VIBE_OPTIONS.slice(0, 4);
  
  const getCurrentVibeIcon = () => {
    const found = VIBE_OPTIONS.find(v => v.name === settings.currentVibe);
    return found ? found.icon : '✨';
  };

  const handleRefine = async () => {
    if (!settings.situation.trim()) return;
    setIsRefining(true);
    try {
      const refined = await refineSituation(settings.situation);
      setSettings(prev => ({
        ...prev,
        situation: refined.situation,
        goal: refined.goal
      }));
    } catch (e) {
      console.error("Refinement failed", e);
    } finally {
      setIsRefining(false);
    }
  };

  const toggleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition not supported.");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        handleChange('situation', transcript);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl h-[90vh] apple-glass rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="p-8 md:p-12 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">Chat Profile</h2>
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.3em] mt-1">Tell us about this chat</p>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={onFinalize}
              className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Save Profile
            </button>
            <button 
              onClick={onClose}
              className="w-14 h-14 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-10">
              <section>
                <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6">Who's chatting?</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">My gender</label>
                    <select 
                      value={settings.userGender}
                      onChange={(e) => handleChange('userGender', e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Their gender</label>
                    <select 
                      value={settings.targetGender}
                      onChange={(e) => handleChange('targetGender', e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6">Relationship</h3>
                <select 
                  value={settings.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                >
                  {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </section>

              <section>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">What's the goal?</h3>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {GOAL_TEMPLATES.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => handleChange('goal', template.name)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        settings.goal === template.name
                          ? 'bg-white text-black border-white shadow-lg'
                          : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/20'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>

                <textarea 
                  value={settings.goal}
                  onChange={(e) => handleChange('goal', e.target.value)}
                  placeholder="e.g., Get a date, stay friendly, solve a problem..."
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-2xl p-6 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] resize-none shadow-inner"
                />
              </section>
            </div>

            <div className="space-y-10">
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">The Story (Optional)</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleVoice}
                      className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-900 text-zinc-500 hover:text-white border border-white/10'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                    </button>
                    <button 
                      onClick={handleRefine}
                      disabled={isRefining || !settings.situation}
                      className="px-5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-30 transition-all"
                    >
                      {isRefining ? 'Polishing...' : 'Polish text'}
                    </button>
                  </div>
                </div>
                <textarea 
                  value={settings.situation}
                  onChange={(e) => handleChange('situation', e.target.value)}
                  placeholder="What's been happening lately? We now support Luganda & English-mix (Luglish). The more we know, the better the replies."
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-[2rem] p-8 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[340px] resize-none"
                />
              </section>
            </div>
          </div>

          <section>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Active Vibe</h3>
              <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                <span className="text-xl">{getCurrentVibeIcon()}</span>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{settings.currentVibe}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {topVibes.map(v => (
                <button
                  key={v.name}
                  onClick={() => handleChange('currentVibe', v.name)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all border ${
                    settings.currentVibe === v.name 
                    ? 'bg-white text-black border-white shadow-xl scale-105' 
                    : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 border-white/5'
                  }`}
                >
                  <span className="text-2xl">{v.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{v.name}</span>
                </button>
              ))}

              <button
                onClick={() => setIsVibeModalOpen(true)}
                className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-500 hover:scale-110 active:scale-90 transition-all group"
                title="Create or select more vibes"
              >
                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
              </button>

              <button
                onClick={() => setIsVibeModalOpen(true)}
                className="px-6 py-4 bg-zinc-900 text-zinc-400 rounded-2xl border border-white/5 hover:bg-zinc-800 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                More Vibes
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-10 border-t border-white/5">
            {[
              { key: 'confidence', label: 'Confidence' },
              { key: 'humor', label: 'Funny level' },
              { key: 'humanity', label: 'Slang level' }
            ].map(({ key, label }) => (
              <div key={key}>
                <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">
                  <span>{label}</span>
                  <span className="text-white">{(settings as any)[key]}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={(settings as any)[key]}
                  onChange={(e) => handleChange(key as any, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </section>
        </div>
      </div>

      <VibeModal 
        isOpen={isVibeModalOpen}
        onClose={() => setIsVibeModalOpen(false)}
        currentVibe={settings.currentVibe}
        onSelectVibe={(v) => handleChange('currentVibe', v)}
        customVibes={customVibes}
        onAddCustomVibe={(v) => setCustomVibes(prev => [...prev, v])}
      />
    </div>
  );
};
