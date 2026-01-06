
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SettingsModal } from './components/SettingsModal';
import { InputArea } from './components/InputArea';
import { SuggestionsModal } from './components/SuggestionsModal';
import { HistoryList } from './components/HistoryList';
import { ReviewCarousel } from './components/ReviewCarousel';
import { LandingPage } from './components/LandingPage';
import { OnboardingPage } from './components/OnboardingPage';
import { DocumentationModal } from './components/DocumentationModal';
import { AnalysesModal } from './components/AnalysesModal';
import { UserSettings, MessageContext, Suggestion, Conversation, ChatMessage, SocialReview } from './types';
import { INITIAL_SETTINGS } from './constants';
import { generateReplies, generateSocialReview } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { dataService } from './services/dataService';
import { Session } from '@supabase/supabase-js';

const STORAGE_KEY = 'reply_app_history';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'onboarding' | 'app'>('landing');
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentThread, setCurrentThread] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsLoadingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [mode, setMode] = useState<'chat' | 'status'>('chat');
  const [currentReview, setCurrentReview] = useState<SocialReview | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showAnalyses, setShowAnalyses] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (session?.user) {
        try {
          // 1. Check for existing profile
          const profile = await dataService.getProfile(session.user.id);

          if (profile) {
            // Existing user: Load their settings
            setSettings({
              userName: profile.user_name || '',
              agentName: profile.agent_name || 'Reply',
              userGender: profile.user_gender || 'Male',
              targetGender: profile.target_gender || 'Female',
              relationship: profile.relationship || 'Friend',
              currentVibe: profile.current_vibe || 'Witty',
              situation: profile.situation || '',
              goal: profile.goal || '',
              confidence: profile.confidence || 80,
              humor: profile.humor || 50,
              humanity: profile.humanity || 90,
              isProfileSetup: profile.is_profile_setup || false
            });

            // If profile is setup, go to app, otherwise onboarding
            if (profile.is_profile_setup) {
              setView('app');
            } else {
              setView('onboarding');
            }
          } else {
            // New user: If they have local settings from guest mode, save them
            if (settings.isProfileSetup) {
              await dataService.saveProfile(session.user.id, settings);
              setView('app');
            } else {
              // Otherwise, guide to onboarding
              setView('onboarding');
            }
          }

          // 2. Sync History
          const cloudHistory = await dataService.getHistory(session.user.id);

          if (cloudHistory.length > 0) {
            // Load cloud history
            setHistory(cloudHistory.map(c => ({
              id: c.id,
              timestamp: c.timestamp,
              settings: c.settings,
              context: c.context,
              suggestions: c.suggestions,
              review: c.review,
              summary: c.summary
            })));
          } else if (history.length > 0) {
            // If cloud is empty but local has history (guest mode), sync local to cloud
            for (const conv of history) {
              await dataService.saveConversation(session.user.id, conv);
            }
          }
        } catch (e) {
          console.error("Failed to sync data with Supabase", e);
          // Fallback to onboarding if sync fails for a new user
          if (view === 'landing') setView('onboarding');
        }
      } else {
        // Guest mode: Load from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setHistory(parsed);
            if (parsed.length > 0) {
              const last = parsed[0];
              setSettings(last.settings);
            }
          } catch (e) {
            console.error("Failed to parse history", e);
          }
        }
      }
    };
    loadData();
  }, [session]);

  useEffect(() => {
    if (!session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history, session]);

  useEffect(() => {
    if (session?.user && settings.isProfileSetup) {
      dataService.saveProfile(session.user.id, settings).catch(console.error);
    }
  }, [settings, session]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleProcess = async (context: MessageContext) => {
    if (!settings.isProfileSetup) {
      setShowSettingsModal(true);
      setError("Please set up your chat profile first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentReview(null);
    try {
      const results = await generateReplies(settings, context);
      setSuggestions(results);
      setShowSuggestionsModal(true);

      const newConv: Conversation = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        settings: { ...settings },
        context: { ...context },
        suggestions: results,
      };

      setHistory(prev => [newConv, ...prev.filter(c => c.id !== activeConversationId)]);
      setActiveConversationId(newConv.id);

      if (session?.user) {
        await dataService.saveConversation(session.user.id, newConv);
      }
    } catch (err) {
      setError("Something went wrong. Please check your data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    const context: MessageContext = {
      type: mode,
      thread: currentThread,
    };
    handleProcess(context);
  };

  const handleReview = async () => {
    if (currentThread.length === 0) return;
    setIsLoadingReview(true);
    try {
      const review = await generateSocialReview(settings, { type: mode, thread: currentThread });
      setCurrentReview(review);
      setShowReview(true);

      if (activeConversationId) {
        setHistory(prev => prev.map(c => c.id === activeConversationId ? { ...c, review } : c));
      }
    } catch (e) {
      setError("Failed to generate review.");
    } finally {
      setIsLoadingReview(false);
    }
  };

  const handleReplyUsed = (text: string) => {
    const newMsg: ChatMessage = { sender: 'me', text, timestamp: Date.now() };
    if (mode === 'status') setMode('chat');
    setCurrentThread(prev => [...prev, newMsg]);
    setShowSuggestionsModal(false);
  };

  const handleAddMessage = (msg: ChatMessage) => {
    setCurrentThread(prev => [...prev, msg]);
  };

  const handleRemoveMessage = (index: number) => {
    setCurrentThread(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectHistory = (conv: Conversation) => {
    setSettings({ ...conv.settings, isProfileSetup: true });
    setSuggestions(conv.suggestions);
    setCurrentThread(conv.context.thread || []);
    setActiveConversationId(conv.id);
    setMode(conv.context.type);
    setShowSettingsModal(false);
    setCurrentReview(conv.review || null);
    setView('app');
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) handleNewConversation();
    if (session?.user) {
      dataService.deleteConversation(session.user.id, id).catch(console.error);
    }
  };

  const handleNewConversation = () => {
    const resetSettings = { ...INITIAL_SETTINGS, userName: settings.userName, agentName: settings.agentName, isProfileSetup: true };
    setSettings(resetSettings);
    setSuggestions([]);
    setCurrentThread([]);
    setActiveConversationId(null);
    setError(null);
    setShowSettingsModal(true);
    setMode('chat');
    setCurrentReview(null);
  };

  const finalizeProfile = () => {
    setSettings(prev => ({ ...prev, isProfileSetup: true }));
    setShowSettingsModal(false);
    setError(null);
    setView('app');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setHistory([]);
    setSettings(INITIAL_SETTINGS);
    setView('landing');
  };

  const handleSignIn = () => {
    if (settings.isProfileSetup || history.length > 0) {
      setView('app');
    } else {
      setView('onboarding');
    }
  };

  if (view === 'landing') {
    return <LandingPage onEnter={handleSignIn} />;
  }

  if (view === 'onboarding') {
    return <OnboardingPage settings={settings} setSettings={setSettings} onComplete={finalizeProfile} />;
  }

  return (
    <Layout onShowDocs={() => setShowDocsModal(true)}>
      {showReview && currentReview && (
        <ReviewCarousel review={currentReview} onClose={() => setShowReview(false)} />
      )}

      {showSuggestionsModal && (
        <SuggestionsModal
          isOpen={showSuggestionsModal}
          onClose={() => setShowSuggestionsModal(false)}
          suggestions={suggestions}
          onReplyUsed={handleReplyUsed}
          onRegenerate={handleRegenerate}
          isLoading={isLoading}
          activeSettings={settings}
        />
      )}

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        setSettings={setSettings}
        onFinalize={finalizeProfile}
      />

      <DocumentationModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
      />

      <AnalysesModal
        isOpen={showAnalyses}
        onClose={() => setShowAnalyses(false)}
        history={history}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative animate-in fade-in duration-1000">
        <div className="lg:col-span-8 order-1 flex flex-col gap-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-6xl font-black text-white tracking-tighter leading-none">
                  Get <span className="text-indigo-500">Replies.</span>
                </h2>
                <div className="bg-indigo-600/10 border border-indigo-500/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-indigo-400">Agent: {settings.agentName}</span>
                </div>
              </div>
              <button
                onClick={() => setShowAnalyses(true)}
                className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px] hover:text-indigo-400 transition-colors text-left"
              >
                {mode === 'chat' ? `${settings.userName || 'Profile'} vs ${settings.relationship}` : 'Analysis'}
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSettingsModal(true)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all bg-white text-black shadow-2xl hover:scale-105 active:scale-95`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Social Context
              </button>
              {session && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all bg-zinc-900 text-zinc-500 hover:text-red-400 border border-white/5"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>

          <div className={`transition-all duration-700 ${!settings.isProfileSetup ? 'blur-md pointer-events-none opacity-40 scale-95' : 'blur-0 opacity-100 scale-100'}`}>
            <InputArea
              onProcess={handleProcess}
              isLoading={isLoading}
              currentThread={currentThread}
              onAddMessage={handleAddMessage}
              onRemoveMessage={handleRemoveMessage}
              onClearThread={() => setCurrentThread([])}
              mode={mode}
              setMode={setMode}
            />
          </div>

          {currentThread.length > 2 && settings.isProfileSetup && (
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={handleReview}
                disabled={isSummarizing}
                className="flex items-center gap-5 px-14 py-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(79,70,229,0.35)] hover:scale-105 active:scale-95 transition-all group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                {isSummarizing ? 'Analyzing Meta-Vibe...' : 'Check Momentum'}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/5 border border-red-500/10 text-red-500/80 px-8 py-6 rounded-[2.5rem] text-xs font-black uppercase tracking-widest flex items-center gap-6 animate-in shake-in duration-500">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              {error}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowSuggestionsModal(true)}
                className="px-12 py-5 bg-zinc-900 border border-white/5 text-white rounded-[1.75rem] font-black text-[11px] uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                View Predictions
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 order-2 flex flex-col gap-12 sticky top-12">
          <button
            onClick={handleNewConversation}
            className="w-full py-6 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <div className="relative flex items-center gap-4 group-hover:text-white transition-colors">
              <svg className="w-5 h-5 transition-transform duration-700 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              New Thread
            </div>
          </button>

          <button
            onClick={() => setShowAnalyses(true)}
            className="w-full py-8 bg-zinc-900 border border-white/5 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 group"
          >
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Analyses
          </button>

          <HistoryList
            history={history}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistory}
            onClearAll={() => { setHistory([]); handleNewConversation(); }}
            activeId={activeConversationId || undefined}
          />


          {isInstallable && (
            <div className="fixed top-0 left-0 right-0 z-[500] p-4 animate-in slide-in-from-top duration-500">
              <div className="max-w-6xl mx-auto apple-glass rounded-2xl p-4 flex items-center justify-between shadow-2xl border-indigo-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-xl">R</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Install Reply App</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Access Sync from your home screen</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsInstallable(false)}
                    className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                  >
                    Later
                  </button>
                  <button
                    onClick={handleInstall}
                    className="px-6 py-2 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    Install Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;
