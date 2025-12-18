
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SelectedGenre, DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';

interface VocalBoothSpecs {
  recording: {
    micType: string;
    placement: string;
    preampSettings: string;
    trackingCompression: string;
  };
  processing: {
    deEsserFreq: string;
    surgicalEQ: string;
    compressionChain: string;
    tonalShaping: string;
    spatialArchitecture: string;
  };
  genreLogic: string;
}

interface VocalBoothProps {
  activeDAW: DAWType;
  genre: SelectedGenre | null;
}

const VocalBooth: React.FC<VocalBoothProps> = ({ activeDAW, genre }) => {
  const [specs, setSpecs] = useState<VocalBoothSpecs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracking' | 'mixing'>('tracking');

  const fetchVocalSpecs = async () => {
    if (!genre) return;
    setIsLoading(true);
    setSpecs(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const daw = DAW_PROFILES[activeDAW];

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a Senior Vocal Engineer specializing in high-end vocal production. 
        Provide end-to-end guidance for tracking and mixing vocals in the genre "${genre.sub}" (${genre.cat}) using "${activeDAW}".

        DAW CONTEXT:
        - Terminology: ${daw.terminology.join(', ')}.
        - Stock plugins AVAILABLE in ${activeDAW}: ${daw.stockPlugins.join(', ')}.
        - Workflow: ${daw.workflowFocus}.

        Return the data in the following JSON structure:
        {
          "recording": {
            "micType": "Recommended mic category and specific type (e.g. Large Diaphragm Condenser, C800 style)",
            "placement": "Distance and angle relative to the mouth",
            "preampSettings": "Desired tone (Clean/Tube) and gain staging advice",
            "trackingCompression": "Settings for hardware or input channel processing (Ratio, Threshold tip)"
          },
          "processing": {
            "deEsserFreq": "Primary frequency range to target for this genre/vocal type",
            "surgicalEQ": "Specific ranges to cut for clarity (mud, resonance) using ${activeDAW} tools",
            "compressionChain": "A detailed serial or parallel compression chain using SPECIFIC stock plugins from the provided list (${daw.stockPlugins.join(', ')}). Explain why these specific tools work for ${genre.sub} vocals.",
            "tonalShaping": "Detailed tonal enhancement steps (Saturation, Exciters, Air EQ) using EXACT stock ${activeDAW} plugins like ${daw.stockPlugins.join(', ')}.",
            "spatialArchitecture": "Reverb and Delay routing and settings for depth, referencing stock spatial tools."
          },
          "genreLogic": "The engineering philosophy for vocals in this specific genre."
        }`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      const data = JSON.parse(response.text);
      setSpecs(data);
    } catch (err) {
      console.error("Vocal Booth Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVocalSpecs();
  }, [genre, activeDAW]);

  if (!genre) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
        <div className="w-20 h-20 bg-pink-600/10 rounded-full flex items-center justify-center mb-6 border border-pink-500/20">
          <span className="text-4xl">🎤</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Vocal Booth Standby</h3>
        <p className="text-zinc-500 max-w-md">
          Calibrate your session genre in the **Assistant Chat** to receive professional vocal tracking and mixing specifications.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden pb-8">
      {/* Stage Selector */}
      <div className="flex gap-4 p-1 bg-zinc-950/60 rounded-2xl border border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tracking'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/20'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span>🎙️</span> Recording Phase
        </button>
        <button
          onClick={() => setActiveTab('mixing')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'mixing'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/20'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span>🎚️</span> Mixing Phase
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Main Content Pane */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          {isLoading ? (
            <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Architecting Vocal Environment...</p>
            </div>
          ) : specs && (
            <div className="animate-in fade-in duration-700 space-y-6">
              {activeTab === 'tracking' ? (
                <>
                  <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <span className="text-9xl font-black">REC</span>
                    </div>
                    <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6">Mic & Hardware Setup</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      <div className="space-y-4">
                        <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl group hover:border-pink-500/30 transition-all">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Microphone Target</span>
                          <p className="text-sm text-zinc-300 font-medium leading-relaxed">{specs.recording.micType}</p>
                        </div>
                        <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl group hover:border-pink-500/30 transition-all">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Distance & Angle</span>
                          <p className="text-sm text-zinc-300 font-medium leading-relaxed">{specs.recording.placement}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl group hover:border-pink-500/30 transition-all">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Preamp Calibration</span>
                          <p className="text-sm text-zinc-300 font-medium leading-relaxed">{specs.recording.preampSettings}</p>
                        </div>
                        <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl group hover:border-pink-500/30 transition-all">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Tracking Dynamics</span>
                          <p className="text-sm text-zinc-300 font-medium leading-relaxed">{specs.recording.trackingCompression}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-pink-900/5 border border-pink-500/10 rounded-3xl p-8 italic text-zinc-400 text-sm leading-relaxed">
                    "Recording vocals for **{genre.sub}** requires a specific room treatment strategy. Ensure you have a reflection filter or a controlled booth to capture a 'dry' signal that responds well to processing in **{activeDAW}**."
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md relative overflow-hidden">
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Mix Processing Chain</h3>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">De-Essing Focus</span>
                          <p className="text-sm text-zinc-300 font-medium">{specs.processing.deEsserFreq}</p>
                        </div>
                        <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Surgical EQ Targets</span>
                          <p className="text-sm text-zinc-300 font-medium">{specs.processing.surgicalEQ}</p>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl">
                        <span className="text-[10px] text-blue-400 uppercase font-black tracking-widest block mb-2">Compression Architecture</span>
                        <p className="text-sm text-zinc-200 font-bold leading-relaxed">{specs.processing.compressionChain}</p>
                      </div>

                      <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Tonal Shaping & Air</span>
                        <p className="text-sm text-zinc-300 leading-relaxed">{specs.processing.tonalShaping}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md">
                    <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4">Spatial Architecture</h3>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-sm text-zinc-300 leading-relaxed font-medium italic">
                      {specs.processing.spatialArchitecture}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Insight Column */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md flex-1">
            <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-6 h-px bg-pink-500/30"></span>
              Engineering Philosophy
            </h4>
            
            {isLoading ? (
               <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-800 rounded w-[90%]"></div>
                  <div className="h-32 bg-zinc-800 rounded w-full"></div>
               </div>
            ) : specs && (
              <div className="space-y-6">
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  "{specs.genreLogic}"
                </p>
                
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                   <h5 className="text-[10px] text-zinc-500 font-bold uppercase mb-2">DAW Strategy ({activeDAW})</h5>
                   <p className="text-[11px] text-zinc-500 leading-relaxed">
                     When processing in {activeDAW}, remember to use {DAW_PROFILES[activeDAW].terminology[1] || 'Sends'} for spatial effects to maintain phase coherence and allow for precise parallel control.
                   </p>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={fetchVocalSpecs}
            className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-pink-900/20 active:scale-[0.98]"
          >
            Regenerate Vocal Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default VocalBooth;
