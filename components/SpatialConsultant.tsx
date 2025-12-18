
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SelectedGenre, DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';

interface SpatialSettings {
  reverbType: string;
  decayTime: string;
  preDelay: string;
  reverbMix: string;
  delayType: string;
  delayFeedback: string;
  stereoWidth: string;
  logic: string;
}

interface SpatialTarget {
  id: string;
  name: string;
  icon: string;
}

const SPATIAL_TARGETS: SpatialTarget[] = [
  { id: 'vocals', name: 'Vocals', icon: '🎤' },
  { id: 'snare', name: 'Snare Drum', icon: '🥁' },
  { id: 'synths', name: 'Synths/Keys', icon: '🎹' },
  { id: 'guitars', name: 'Guitars', icon: '🎸' },
  { id: 'master', name: 'Master Bus', icon: '🎚️' },
];

interface SpatialConsultantProps {
  activeDAW: DAWType;
  selectedGenre: SelectedGenre | null;
}

const SpatialConsultant: React.FC<SpatialConsultantProps> = ({ activeDAW, selectedGenre }) => {
  const [activeTarget, setActiveTarget] = useState<SpatialTarget>(SPATIAL_TARGETS[0]);
  const [settings, setSettings] = useState<SpatialSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const consultSpatial = async (target: SpatialTarget) => {
    if (!selectedGenre) return;
    setIsLoading(true);
    setSettings(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const daw = DAW_PROFILES[activeDAW];

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a Spatial Dimension Consultant specialized in reverb, delay, and stereo field architecture. 
        Provide professional spatial processing guidance for "${target.name}" in the genre of "${selectedGenre.sub}" (${selectedGenre.cat}). 
        
        The user is working in ${activeDAW}.
        
        DAW CONTEXT:
        - Terminology: ${daw.terminology.join(', ')}.
        - Stock reverb/delay/spatial plugins: ${daw.stockPlugins.join(', ')}.
        - ${daw.reasoningInjection}

        Focus on creating depth, width, and professional atmosphere using ${activeDAW} specific features.
        
        Return ONLY a JSON object with:
        "reverbType": (string, specific ${activeDAW} plugin or mode like "Hall" or "Plate")
        "decayTime": (string, e.g., "1.2s")
        "preDelay": (string, e.g., "20ms")
        "reverbMix": (string, e.g., "15%" or "Aux Send level")
        "delayType": (string, specific ${activeDAW} delay mode)
        "delayFeedback": (string, e.g., "25%")
        "stereoWidth": (string, e.g., "Slightly Wide" or "Focused")
        "logic": (string, explaining the choices and how to route them in ${activeDAW} for this genre).`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      const parsed = JSON.parse(response.text);
      setSettings(parsed);
    } catch (error) {
      console.error("Spatial Consultant Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGenre) {
      consultSpatial(activeTarget);
    }
  }, [selectedGenre, activeTarget, activeDAW]);

  const SpaceParameter = ({ label, value, colorClass }: { label: string, value: string, colorClass: string }) => (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center group hover:border-purple-500/40 transition-all shadow-inner">
      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">{label}</span>
      <span className={`text-base font-bold ${colorClass} group-hover:scale-105 transition-transform truncate w-full`}>{value}</span>
    </div>
  );

  if (!selectedGenre) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
        <div className="w-20 h-20 bg-purple-600/10 rounded-full flex items-center justify-center mb-6 border border-purple-500/20">
          <span className="text-4xl">🌊</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Dimension Lab Offline</h3>
        <p className="text-zinc-500 max-w-md">
          Spatial characteristics define a genre's acoustic environment. Calibrate your session in the **Assistant Chat** to access the dimension architect.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Target Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {SPATIAL_TARGETS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTarget(t)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all whitespace-nowrap ${
              activeTarget.id === t.id
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-purple-500/30 hover:text-purple-200'
            }`}
          >
            <span>{t.icon}</span>
            <span className="text-xs font-bold uppercase tracking-tight">{t.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Spatial Processor Rack */}
        <div className="lg:col-span-8 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md flex flex-col relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 opacity-5 pointer-events-none">
             <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500" strokeDasharray="4 4"/>
                <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500" strokeDasharray="8 8"/>
             </svg>
          </div>

          <header className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">{activeDAW} Spatial Dimension Protocol</h3>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                {activeTarget.icon} {activeTarget.name} Environment
              </p>
            </div>
            <div className="text-right">
               <span className="text-[10px] text-zinc-500 font-bold uppercase">DAW: {activeDAW}</span>
               <div className="flex gap-1 mt-2">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-4 rounded-sm ${i < 4 ? 'bg-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'bg-zinc-800'}`}
                    ></div>
                  ))}
               </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col justify-center relative z-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4 opacity-50">
                <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Architecting {activeDAW} Space...</p>
              </div>
            ) : settings && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in zoom-in-95 duration-300">
                <div className="col-span-2 bg-purple-600/10 border border-purple-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                   <span className="text-[10px] text-purple-400 uppercase font-black tracking-widest mb-1">Module / Plugin</span>
                   <span className="text-xl font-black text-white">{settings.reverbType}</span>
                </div>
                <SpaceParameter label="Decay" value={settings.decayTime} colorClass="text-purple-400" />
                <SpaceParameter label="Pre-Delay" value={settings.preDelay} colorClass="text-zinc-300" />
                
                <SpaceParameter label="Mix / Send" value={settings.reverbMix} colorClass="text-purple-300" />
                <div className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center group hover:border-blue-500/40 transition-all shadow-inner">
                   <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Delay Configuration</span>
                   <span className="text-base font-bold text-blue-400 group-hover:scale-105 transition-transform truncate w-full">{settings.delayType}</span>
                </div>
                <SpaceParameter label="Feedback" value={settings.delayFeedback} colorClass="text-blue-300" />
                
                <div className="col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between group hover:border-emerald-500/40 transition-all">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Stereo Image Target</span>
                      <span className="text-sm font-bold text-emerald-400">{settings.stereoWidth}</span>
                   </div>
                   <div className="flex gap-0.5">
                      <div className="w-1 h-6 bg-emerald-500/20 rounded-full"></div>
                      <div className="w-1 h-8 bg-emerald-500/40 rounded-full"></div>
                      <div className="w-1 h-10 bg-emerald-500/60 rounded-full"></div>
                      <div className="w-1 h-8 bg-emerald-500/40 rounded-full"></div>
                      <div className="w-1 h-6 bg-emerald-500/20 rounded-full"></div>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-between items-center relative z-10">
             <div className="flex gap-6">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500/50"></div>
                   <span className="text-[10px] text-zinc-500 font-bold uppercase">Diffusion ON</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/50"></div>
                   <span className="text-[10px] text-zinc-500 font-bold uppercase">Phase Check Active</span>
                </div>
             </div>
             <div className="text-[10px] font-mono text-zinc-600 uppercase">
                {activeDAW} ENVIRONMENT
             </div>
          </div>
        </div>

        {/* Spatial Insight */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md overflow-y-auto custom-scrollbar flex flex-col">
            <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-purple-500/30"></span>
              Acoustic Strategy
            </h4>
            
            {isLoading ? (
               <div className="space-y-3">
                  <div className="h-4 bg-zinc-800 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-zinc-800 rounded w-[90%] animate-pulse"></div>
                  <div className="h-4 bg-zinc-800 rounded w-[85%] animate-pulse"></div>
               </div>
            ) : settings && (
              <div className="flex-1 flex flex-col">
                <p className="text-sm text-zinc-300 leading-relaxed italic mb-8">
                  "{settings.logic}"
                </p>
                
                <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-5 mt-auto">
                   <h5 className="text-[10px] text-purple-400 font-bold uppercase mb-2">Technical Warning</h5>
                   <p className="text-[11px] text-zinc-400 leading-relaxed">
                     In {selectedGenre.sub}, over-processing the {activeTarget.name}'s low frequencies with spatial effects in ${activeDAW} can cause phase issues. Use ${activeDAW} EQ to cut below 200Hz on the reverb return.
                   </p>
                </div>
                
                <button 
                  className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-zinc-700 active:scale-95"
                  onClick={() => consultSpatial(activeTarget)}
                >
                  Architect Space Matrix
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default SpatialConsultant;
