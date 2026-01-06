
import React, { useState, useRef, useEffect } from 'react';
import { MessageContext, ChatMessage } from '../types';

interface InputAreaProps {
  onProcess: (ctx: MessageContext) => void;
  isLoading: boolean;
  currentThread: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onClearThread: () => void;
  onRemoveMessage: (index: number) => void;
  mode: 'chat' | 'status';
  setMode: (mode: 'chat' | 'status') => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onProcess,
  isLoading,
  currentThread,
  onAddMessage,
  onClearThread,
  onRemoveMessage,
  mode,
  setMode
}) => {
  const [inputText, setInputText] = useState('');
  const [sender, setSender] = useState<'me' | 'them'>('them');
  const [isRecording, setIsRecording] = useState(false);
  const [isListeningInput, setIsListeningInput] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'video' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup recognition on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
        if (file.type.startsWith('image/')) setMediaType('image');
        else if (file.type.startsWith('video/')) setMediaType('video');
        else if (file.type.startsWith('audio/')) setMediaType('audio');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleListeningInput = () => {
    if (isListeningInput) {
      recognitionRef.current?.stop();
      setIsListeningInput(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition not supported.");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListeningInput(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInputText(transcript);
      };
      recognition.onend = () => setIsListeningInput(false);
      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        setIsListeningInput(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
          const reader = new FileReader();
          reader.onloadend = () => {
            setMediaPreview(reader.result as string);
            setMediaType('audio');
          };
          reader.readAsDataURL(audioBlob);
        };
        recorder.start();
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access denied.");
      }
    }
  };

  const handleAddClick = () => {
    if (!inputText.trim()) return;
    onAddMessage({
      sender,
      text: inputText.trim(),
      timestamp: Date.now()
    });
    setInputText('');
  };

  const handleGenerate = () => {
    const context: MessageContext = {
      type: mode,
      thread: mode === 'chat' ? currentThread : [],
      imageBase64: mediaType === 'image' ? mediaPreview || undefined : undefined,
      audioBase64: mediaType === 'audio' ? mediaPreview || undefined : undefined,
      videoBase64: mediaType === 'video' ? mediaPreview || undefined : undefined,
    };
    onProcess(context);
  };

  const clearMedia = () => {
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="apple-glass rounded-[2rem] md:rounded-[3rem] p-4 md:p-12 flex flex-col gap-6 md:gap-10 border border-white/10 shadow-2xl overflow-hidden relative group/inputarea">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none"></div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,audio/*"
      />

      <div className="flex justify-between items-center px-2">
        <div className="flex bg-zinc-900/60 p-1.5 rounded-[1.25rem] w-fit border border-white/5 backdrop-blur-md">
          {['chat', 'status'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${mode === m ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {m}
            </button>
          ))}
        </div>
        {mode === 'chat' && currentThread.length > 0 && (
          <button onClick={onClearThread} className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Clear Thread
          </button>
        )}
      </div>

      {mode === 'chat' && (
        <div className="flex flex-col gap-4 md:gap-6 min-h-[300px] md:min-h-[400px] max-h-[600px] md:max-h-[700px] overflow-y-auto custom-scrollbar pr-2 md:pr-4 bg-black/20 rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 border border-white/5 shadow-inner relative">
          {currentThread.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 opacity-20">
              <div className="w-24 h-24 rounded-[2rem] border border-dashed border-white/30 flex items-center justify-center mb-8 animate-pulse">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <p className="text-sm font-black uppercase tracking-[0.6em] font-outfit">No Social Context</p>
              <p className="text-[11px] text-zinc-500 font-bold mt-4 uppercase text-center max-w-[260px] leading-relaxed tracking-widest">Map the dialogue turn-by-turn for maximum momentum</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {currentThread.map((msg, idx) => (
                <div
                  key={idx}
                  className={`group flex items-end gap-4 transition-all animate-in slide-in-from-bottom-4 duration-500 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-[9px] font-black shadow-xl transition-transform group-hover:scale-110 ${msg.sender === 'me'
                    ? 'bg-indigo-600 text-white order-2 shadow-indigo-600/20'
                    : 'bg-zinc-800 text-zinc-500 border border-white/10 order-1'
                    }`}>
                    {msg.sender === 'me' ? 'ME' : 'TGT'}
                  </div>

                  <div className={`relative flex flex-col max-w-[80%] ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3 md:px-7 md:py-5 rounded-[1.5rem] md:rounded-[2rem] text-[14px] md:text-[16px] font-medium leading-relaxed shadow-lg transition-all duration-500 group-hover:shadow-2xl ${msg.sender === 'me'
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-br-none'
                      : 'bg-zinc-900/80 text-zinc-100 rounded-bl-none border border-white/5 backdrop-blur-xl'
                      }`}>
                      {msg.text}
                    </div>

                    <div className={`flex items-center gap-6 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => onRemoveMessage(idx)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/20 hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {mode === 'chat' && (
          <div className="relative group/textarea">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddClick(); } }}
              placeholder="Dictate or paste latest text here..."
              className="w-full bg-zinc-900/40 border border-white/5 text-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-sm md:text-lg focus:ring-4 focus:ring-indigo-500/10 outline-none min-h-[150px] md:min-h-[200px] resize-none placeholder:text-zinc-800 transition-all hover:bg-zinc-900/60 shadow-inner font-medium"
            />

            <div className="absolute top-6 right-6 md:top-10 md:right-10 flex flex-col gap-3 md:gap-5">
              <button
                onClick={() => setSender(s => s === 'me' ? 'them' : 'me')}
                className={`text-[8px] md:text-[10px] font-black px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl transition-all uppercase tracking-[0.3em] border hover:scale-110 active:scale-90 ${sender === 'me' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_10px_30px_rgba(99,102,241,0.3)]' : 'bg-zinc-800/80 text-zinc-600 border-zinc-700 backdrop-blur-md'}`}
              >
                {sender === 'me' ? 'Sender: ME' : 'Sender: THEM'}
              </button>
              <button
                onClick={toggleListeningInput}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isListeningInput ? 'bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-zinc-800/80 text-zinc-600 hover:text-white hover:border-white/20 hover:scale-110 active:scale-90 backdrop-blur-md'}`}
                title={isListeningInput ? "Stop Listening" : "Start Listening"}
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
            </div>

            <button
              onClick={handleAddClick}
              disabled={!inputText.trim()}
              className="absolute bottom-6 right-6 md:bottom-10 md:right-10 w-12 h-12 md:w-16 md:h-16 bg-white text-black rounded-xl md:rounded-[1.5rem] shadow-2xl hover:scale-110 active:scale-90 transition-all disabled:opacity-5 flex items-center justify-center group/btn hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover/btn:rotate-90 duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        )}

        {mediaPreview && (
          <div className="relative inline-block group mx-auto animate-in zoom-in-95 duration-500 p-2.5 bg-white/5 rounded-[2.5rem] border border-white/10">
            {mediaType === 'image' && <img src={mediaPreview} className="max-h-80 rounded-[2rem] object-cover shadow-2xl" />}
            {mediaType === 'audio' && (
              <div className="bg-indigo-600/20 px-10 py-8 rounded-[2rem] flex items-center gap-6 border border-indigo-500/20 shadow-xl">
                <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-white uppercase tracking-widest">Audio Context</span>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1">Ready for Processing</span>
                </div>
              </div>
            )}
            <button
              onClick={clearMedia}
              className="absolute -top-4 -right-4 w-10 h-10 bg-zinc-900 border border-white/20 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {mode === 'status' && !mediaPreview && (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-zinc-950/60 backdrop-blur-md group hover:border-indigo-500/20 transition-all duration-500">
            <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-[1.75rem] flex items-center justify-center text-zinc-800 mb-8 group-hover:text-indigo-500 group-hover:scale-110 transition-all">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-10">Vision Input</p>
            <div className="flex gap-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-white/20"
              >
                Upload Context
              </button>
              <button onClick={toggleRecording} className={`px-10 py-4 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${isRecording ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-lg shadow-red-500/20' : 'text-zinc-500 hover:text-white hover:border-white/30 hover:scale-105 active:scale-95'}`}>
                {isRecording ? 'Capturing' : 'Voice Memo'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-10 border-t border-white/5">
        <div className="flex gap-3 md:gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 md:w-14 md:h-14 bg-zinc-900/60 border border-white/5 text-zinc-600 rounded-xl md:rounded-2xl hover:text-indigo-400 hover:border-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          <button
            onClick={toggleRecording}
            className={`w-12 h-12 md:w-14 md:h-14 border border-white/5 rounded-xl md:rounded-2xl transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 ${isRecording ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'bg-zinc-900/60 text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/30'}`}
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || (mode === 'chat' && currentThread.length === 0 && !mediaPreview) || (mode === 'status' && !mediaPreview)}
          className={`flex items-center gap-4 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 transition-all hover-glow ${isLoading ? 'opacity-50 cursor-wait' : 'hover:bg-indigo-500 hover:scale-[1.03] active:scale-[0.97]'}`}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Analyzing</span>
            </div>
          ) : (
            <>
              {mode === 'chat' ? 'Sync' : 'Decode'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
