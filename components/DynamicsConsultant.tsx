
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SelectedGenre, DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';

interface CompressionSettings {
  threshold: string;
  ratio: string;
  attack: string;
  release: string;
  knee: string;
  makeupGain: string;
  targetGainReduction: string;
  logic: string;
}

interface Instrument {
  id: string;
  name: string;
  icon: string;
}

const INSTRUMENTS: Instrument[] = [
  { id: 'kick', name: 'Kick Drum', icon: '🥁' },
  { id: 'snare', name: 'Snare Drum', icon: '🥁' },
  { id: 'bass', name: 'Electric Bass', icon: '🎸' },
  { id: 'vocals', name: 'Lead Vocals', icon: '🎤' },
  { id: 'guitar', name: 'Guitars', icon: '🎸' },
  { id: 'synths', name: 'Synths', icon: '🎹' },
  { id: 'master', name: 'Master Bus', icon: '🎚️' },
];

interface DynamicsConsultantProps {
  activeDAW: DAWType;
  selectedGenre: SelectedGenre | null;
}

const DynamicsConsultant: React.FC<DynamicsConsultantProps> = ({ activeDAW, selectedGenre }) => {
  const [activeInstrument, setActiveInstrument] = useState<Instrument>(INSTRUMENTS[0]);
  const [settings, setSettings] = useState<CompressionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const consultDynamics = async (instrument: Instrument) => {
    if (!selectedGenre) return;
    setIsLoading(true);
    setSettings(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const daw = DAW_PROFILES[activeDAW];

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a Dynamics Consultant specialized in surgical compression and transient shaping. 
        Provide specific, professional compression settings for "${instrument.name}" in the genre "${selectedGenre.sub}" (${selectedGenre.cat}). 
        
        The user is using ${activeDAW}.

        DAW CONTEXT:
        - Terminology: ${daw.terminology.join(', ')}.
        - Stock dynamics plugins/models: ${daw.stockPlugins.join(', ')}.
        - ${daw.reasoningInjection}

        Return ONLY a JSON object with the following fields:
        "threshold": (string, e.g., "-18 dB")
        "ratio": (string, e.g., "4:1")
        "attack": (string, e.g., "15 ms")
        "release": (string, e.g., "120 ms")
        "knee": (string, e.g., "Soft" or "Hard")
        "makeupGain": (string, e.g., "+3 dB")
        "targetGainReduction": (string, e.g., "2-4 dB")
        "logic": (string, explaining the engineering reasoning and how to implement this using specific ${activeDAW} compressor features or models).`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      const parsed = JSON.parse(response.text);
      setSettings(parsed);
    } catch (error) {
      console.error("Dynamics Consultant Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGenre) {
      consultDynamics(activeInstrument);
    }
  }, [selectedGenre, activeInstrument, activeDAW]);

  const ParameterCard = ({ label, value, unit }: { label: string, value: string, unit?: string }) => (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center group hover:border-blue-500/40 transition-all shadow-inner">
      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{value}</span>
        {unit && <span className="text-xs text-zinc-600 font-mono">{unit}</span>}
      </div>
    </div>
  );

  if (!selectedGenre) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
        <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
          <span className="text-4xl">🗜️</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Consultant Offline</h3>
        <p className="text-zinc-500 max-w-md">
          Dynamics processing is genre-specific. Select a sub-genre in the **Assistant Chat** to receive surgical compression guidance.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Instrument Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {INSTRUMENTS.map((inst) => (
          <button
            key={inst.id}
            onClick={() => setActiveInstrument(inst)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all whitespace-nowrap ${
              activeInstrument.id === inst.id
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            <span>{inst.icon}</span>
            <span className="text-xs font-bold uppercase tracking-tight">{inst.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Rack Display */}
        <div className="lg:col-span-8 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md flex flex-col">
          <header className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{activeDAW} Dynamics Engine</h3>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                {activeInstrument.icon} {activeInstrument.name} Protocol
              </p>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] text-zinc-500 font-bold uppercase">Optimal Gain Stage</span>
               <div className="flex gap-0.5 mt-1">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 h-3 rounded-full ${i < 8 ? 'bg-green-500/40' : i < 10 ? 'bg-yellow-500/40' : 'bg-red-500/40'}`}
                    ></div>
                  ))}
               </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4 opacity-50">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Analyzing Transients for {activeDAW}...</p>
              </div>
            ) : settings && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in zoom-in-95 duration-300">
                <ParameterCard label="Threshold" value={settings.threshold} />
                <ParameterCard label="Ratio" value={settings.ratio} />
                <ParameterCard label="Attack" value={settings.attack} />
                <ParameterCard label="Release" value={settings.release} />
                <ParameterCard label="Knee" value={settings.knee} />
                <ParameterCard label="Makeup" value={settings.makeupGain} />
                <ParameterCard label="Target GR" value={settings.targetGainReduction} />
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                   <span className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-1">Peak Hold</span>
                   <span className="text-xs font-bold text-blue-200">Lookahead ON</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-between items-end">
            <div className="flex gap-8">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Active Env</span>
                <span className="text-sm font-mono text-zinc-300">{activeDAW} Engine</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Peak Ceiling</span>
                <span className="text-sm font-mono text-zinc-300">-1.0 dBFS</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-zinc-950 rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
              Circuit: Standard Digital
            </div>
          </div>
        </div>

        {/* Engineering Insight */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="flex-1 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md overflow-y-auto custom-scrollbar">
            <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-purple-500/30"></span>
              {activeDAW} Logic
            </h4>
            
            {isLoading ? (
               <div className="space-y-3">
                  <div className="h-4 bg-zinc-800 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-zinc-800 rounded w-[90%] animate-pulse"></div>
                  <div className="h-4 bg-zinc-800 rounded w-[85%] animate-pulse"></div>
               </div>
            ) : settings && (
              <p className="text-sm text-zinc-400 leading-relaxed italic animate-in fade-in duration-700">
                "{settings.logic}"
              </p>
            )}

            <div className="mt-8 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
               <h5 className="text-[10px] text-zinc-500 font-bold uppercase mb-2">Workflow Tip</h5>
               <p className="text-[11px] text-zinc-500 leading-snug">
                 In {activeDAW}, consider using a {DAW_PROFILES[activeDAW].terminology[0]} to apply these settings. For ${selectedGenre.sub}, the goal is to stabilize the ${activeInstrument.name} without killing the groove.
               </p>
            </div>
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

export default DynamicsConsultant;
