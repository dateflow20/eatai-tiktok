
import React, { useState } from 'react';
import { UserSettings, Gender, Relationship } from '../types';
import { GENDERS, RELATIONSHIPS, VIBE_OPTIONS, AGENT_OPTIONS } from '../constants';

interface OnboardingPageProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ settings, setSettings, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-10 duration-500">
            <h2 className="text-5xl font-black tracking-tighter">What's your name?</h2>
            <div className="relative group">
              <input 
                type="text"
                value={settings.userName}
                onChange={(e) => updateSetting('userName', e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-zinc-900 border border-white/10 text-white rounded-[2rem] p-10 text-3xl font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-800"
              />
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] leading-relaxed">
              This is how we'll personalize your social experience.
            </p>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-10 duration-500">
            <h2 className="text-5xl font-black tracking-tighter text-indigo-500">Choose your Social Agent</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGENT_OPTIONS.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => updateSetting('agentName', agent.name)}
                  className={`flex flex-col gap-4 p-8 rounded-[2.5rem] text-left transition-all border ${
                    settings.agentName === agent.name 
                      ? 'bg-white text-black border-white shadow-2xl scale-[1.02]' 
                      : 'bg-zinc-900 text-zinc-500 border-white/5 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-4xl">{agent.icon}</span>
                    {settings.agentName === agent.name && <span className="text-[10px] font-black bg-black text-white px-3 py-1 rounded-full uppercase tracking-widest">Active</span>}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">{agent.name}</h3>
                    <p className={`text-xs mt-1 font-medium leading-relaxed ${settings.agentName === agent.name ? 'text-zinc-600' : 'text-zinc-500'}`}>
                      {agent.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-10 duration-500">
            <h2 className="text-5xl font-black tracking-tighter">Who are you?</h2>
            <div className="grid grid-cols-2 gap-4">
              {GENDERS.map(g => (
                <button
                  key={g}
                  onClick={() => updateSetting('userGender', g)}
                  className={`p-8 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all border ${
                    settings.userGender === g ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-zinc-900 text-zinc-500 border-white/5 hover:bg-zinc-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-10 duration-500">
            <h2 className="text-5xl font-black tracking-tighter text-indigo-500">The Target.</h2>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {GENDERS.map(g => (
                  <button
                    key={g}
                    onClick={() => updateSetting('targetGender', g)}
                    className={`p-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all border ${
                      settings.targetGender === g ? 'bg-white text-black border-white shadow-xl' : 'bg-zinc-900 text-zinc-500 border-white/5 hover:bg-zinc-800'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Relationship Context</label>
                <div className="grid grid-cols-3 gap-3">
                  {RELATIONSHIPS.map(r => (
                    <button
                      key={r}
                      onClick={() => updateSetting('relationship', r)}
                      className={`p-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                        settings.relationship === r ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-zinc-900 text-zinc-500 border-white/5 hover:bg-zinc-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-10 duration-500">
            <h2 className="text-5xl font-black tracking-tighter">Desired Vibe?</h2>
            <div className="grid grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
              {VIBE_OPTIONS.map(v => (
                <button
                  key={v.name}
                  onClick={() => updateSetting('currentVibe', v.name)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] transition-all border ${
                    settings.currentVibe === v.name ? 'bg-white text-black border-white shadow-2xl' : 'bg-zinc-900 text-zinc-500 border-white/5 hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-3xl">{v.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{v.name}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-10 duration-500">
            <h2 className="text-5xl font-black tracking-tighter text-indigo-500">The Mission.</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Primary Goal</label>
                <textarea
                  value={settings.goal}
                  onChange={(e) => updateSetting('goal', e.target.value)}
                  placeholder="e.g., Secure the bag, get her number, land the job..."
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-[2.5rem] p-10 text-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none min-h-[180px] resize-none shadow-inner"
                />
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed text-center">
                Profile Complete. Your Social Agent <strong>{settings.agentName}</strong> is ready to deploy.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative">
      <div className="absolute top-12 left-12 flex items-center gap-4">
         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-xl shadow-2xl">R</div>
         <span className="text-xs font-black uppercase tracking-[0.4em] text-white/40">Onboarding Phase</span>
      </div>

      <div className="w-full max-w-3xl flex flex-col gap-12">
        {/* Progress bar */}
        <div className="flex gap-2 h-1.5 w-full">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`flex-1 rounded-full transition-all duration-700 ${i + 1 <= step ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/5'}`} />
          ))}
        </div>

        {renderStep()}

        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="px-10 py-6 border border-white/5 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Back
            </button>
          )}
          <button 
            onClick={nextStep}
            disabled={step === 1 && !settings.userName.trim()}
            className="flex-1 px-10 py-6 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-20 disabled:scale-100"
          >
            {step === totalSteps ? 'Activate Profile' : 'Continue'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
