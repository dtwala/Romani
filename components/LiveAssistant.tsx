
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';

interface LiveAssistantProps {
  activeDAW: DAWType;
}

interface TechnicalInsight {
  id: string;
  type: 'OBSERVATION' | 'TIP' | 'ALERT';
  text: string;
  timestamp: string;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ activeDAW }) => {
  const [isLive, setIsLive] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const [insights, setInsights] = useState<TechnicalInsight[]>([]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Simple animation for the pulse effect
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setPulseScale(1 + Math.random() * 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [isLive]);

  const addInsight = (text: string, type: TechnicalInsight['type'] = 'TIP') => {
    const newInsight: TechnicalInsight = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setInsights(prev => [newInsight, ...prev].slice(0, 15));
  };

  const startSession = async () => {
    if (isLive) return;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const daw = DAW_PROFILES[activeDAW];
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
          },
          outputAudioTranscription: {},
          systemInstruction: `You are a world-class sound engineer in a state-of-the-art studio. 
          The user is currently mixing or producing in ${activeDAW}. 
          Provide instant, concise technical guidance calibrated for this studio environment.
          
          DAW SPECIFIC LOGIC:
          - Use ${activeDAW} terminology: ${daw.terminology.join(', ')}.
          - Recommend these ${activeDAW} stock plugins where appropriate: ${daw.stockPlugins.join(', ')}.
          - ${daw.reasoningInjection}
          
          PROACTIVE MONITORING:
          - I am sending you the user's vocal/mic input in real-time. 
          - Listen for: Room resonance, sibilance, level spikes, background noise, or tonal issues.
          - Provide SHORT, professional tips as you hear things.
          - If the user isn't talking, briefly mention an engineering best practice for ${activeDAW}.
          - Stay professional and direct.`,
        },
        callbacks: {
          onopen: () => {
            setIsLive(true);
            addInsight("System online. Listening for technical anomalies...", 'OBSERVATION');
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription for UI feed
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              if (text && text.length > 5) {
                addInsight(text, 'TIP');
              }
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsLive(false),
          onerror: (e) => {
            console.error("Live Error:", e);
            addInsight("Connection interrupted. Check microphone access.", 'ALERT');
          },
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to connect Live Assistant", err);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    setIsLive(false);
    addInsight("Studio assistant session ended.", 'OBSERVATION');
  };

  return (
    <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 backdrop-blur-sm relative overflow-hidden h-full flex flex-col items-center">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="relative z-10 flex flex-col items-center text-center w-full h-full max-w-4xl">
        <div className="mb-6">
           <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-2 block">Voice Protocol</span>
           <div className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Live Assistant @ {activeDAW}
           </div>
        </div>

        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Visualizer Area */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative mb-10">
              {isLive && (
                <>
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse scale-150"></div>
                  <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-xl scale-[2]"></div>
                </>
              )}
              
              <button
                onClick={isLive ? stopSession : startSession}
                style={{ transform: `scale(${isLive ? pulseScale : 1})` }}
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-500 relative z-20 shadow-2xl ${
                  isLive 
                    ? 'bg-red-500/10 border-4 border-red-500 text-red-500' 
                    : 'bg-zinc-900 border-4 border-zinc-700 text-zinc-500 hover:border-blue-500 hover:text-blue-500'
                }`}
              >
                {isLive ? (
                  <>
                    <div className="w-5 h-5 bg-red-500 rounded-sm mb-1"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Standby</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Initialize</span>
                  </>
                )}
              </button>
            </div>

            <div className="max-w-xs">
              <h3 className={`text-lg font-black mb-2 transition-colors ${isLive ? 'text-blue-400' : 'text-zinc-400'} uppercase tracking-tight`}>
                {isLive ? "Engine Engaged" : "Studio Link Offline"}
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                {isLive 
                  ? "Real-time spectral listening active. Talk or sing to receive technical observations." 
                  : "Calibrating for high-performance studio assistance. Click above to begin."}
              </p>
            </div>
          </div>

          {/* Live Insight Feed */}
          <div className="lg:col-span-7 h-full flex flex-col bg-zinc-950/50 rounded-3xl border border-zinc-800 p-6 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-zinc-950/80 to-transparent z-10"></div>
             <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
               Technical Insight Feed
             </h4>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2 scroll-smooth">
               {insights.length === 0 ? (
                 <div className="h-full flex items-center justify-center opacity-20 flex-col gap-2">
                    <div className="w-8 h-px bg-zinc-700"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Feed Empty</span>
                 </div>
               ) : (
                 insights.map((insight) => (
                   <div key={insight.id} className="animate-in slide-in-from-right-4 duration-300 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left group hover:border-blue-500/30 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                          insight.type === 'OBSERVATION' ? 'bg-zinc-800 text-zinc-400' : 
                          insight.type === 'ALERT' ? 'bg-red-900/20 text-red-400' : 'bg-blue-900/20 text-blue-400'
                        }`}>
                          {insight.type}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-600">{insight.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">{insight.text}</p>
                   </div>
                 ))
               )}
             </div>
             <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-zinc-950/80 to-transparent z-10"></div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); opacity: 0.3; }
          50% { transform: scaleY(1.5); opacity: 1; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default LiveAssistant;
