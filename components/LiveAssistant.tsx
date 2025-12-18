
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';

interface LiveAssistantProps {
  activeDAW: DAWType;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ activeDAW }) => {
  const [isLive, setIsLive] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);

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
          systemInstruction: `You are a world-class sound engineer in a state-of-the-art studio. 
          The user is currently mixing or producing in ${activeDAW}. 
          Provide instant, concise technical guidance calibrated for this studio environment.
          
          DAW SPECIFIC LOGIC:
          - Use ${activeDAW} terminology: ${daw.terminology.join(', ')}.
          - Recommend these ${activeDAW} stock plugins where appropriate: ${daw.stockPlugins.join(', ')}.
          - ${daw.reasoningInjection}
          
          Think 'Pro Tools engineer assisting a producer' (adapted for ${activeDAW}). 
          If they ask about a frequency clash, suggest specific Hz ranges to cut. 
          If they ask about compression, suggest specific ratios and release times. 
          If they ask about sound design, explain routing or synthesis concepts briefly.
          Be professional, direct, and slightly technical. Focus on clarity.`,
        },
        callbacks: {
          onopen: () => {
            setIsLive(true);
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
          onerror: (e) => console.error("Live Error:", e),
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
  };

  return (
    <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 backdrop-blur-sm relative overflow-hidden h-full flex flex-col items-center justify-center">
      {/* Decorative background grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-4">
           <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-2 block">Voice Protocol</span>
           <div className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              DAW: {activeDAW}
           </div>
        </div>

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
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 relative z-20 shadow-2xl ${
              isLive 
                ? 'bg-red-500/10 border-4 border-red-500 text-red-500' 
                : 'bg-zinc-900 border-4 border-zinc-700 text-zinc-500 hover:border-blue-500 hover:text-blue-500'
            }`}
          >
            {isLive ? (
              <>
                <div className="w-4 h-4 bg-red-500 rounded-sm mb-1"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Stop</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Activate</span>
              </>
            )}
          </button>
        </div>

        <div className="max-w-sm">
          <h3 className={`text-xl font-bold mb-2 transition-colors ${isLive ? 'text-blue-400' : 'text-zinc-400'}`}>
            {isLive ? "SYSTEM ONLINE" : "ENGINE STANDBY"}
          </h3>
          <p className="text-zinc-500 text-sm leading-relaxed">
            {isLive 
              ? `The AI is listening. Receive real-time ${activeDAW} guidance for tracking, mixing, or troubleshooting.` 
              : `Initiate a high-performance voice connection calibrated for ${activeDAW}.`}
          </p>
        </div>
        
        {isLive && (
          <div className="mt-8 flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 h-8 bg-blue-500/30 rounded-full animate-wave" 
                style={{ animationDelay: `${i * 0.1}s`, height: `${10 + Math.random() * 30}px` }}
              ></div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); opacity: 0.3; }
          50% { transform: scaleY(1.5); opacity: 1; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default LiveAssistant;
