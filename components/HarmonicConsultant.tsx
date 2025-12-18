
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SelectedGenre, DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';
import ExportMenu from './ExportMenu';
import { exportToPDF, exportToDocx, exportToImage } from '../utils/exportUtils';

interface SaturationSettings {
  type: string;
  drive: string;
  mix: string;
  tone: string;
  oversampling: string;
  harmonics: string;
  logic: string;
}

interface SaturationTarget {
  id: string;
  name: string;
  icon: string;
}

const SAT_TARGETS: SaturationTarget[] = [
  { id: 'vocals', name: 'Vocals', icon: '🎤' },
  { id: 'drums', name: 'Drum Bus', icon: '🥁' },
  { id: 'bass', name: 'Bass Guitar', icon: '🎸' },
  { id: 'instruments', name: 'Synths/Keys', icon: '🎹' },
  { id: 'master', name: 'Master Bus', icon: '🎚️' },
];

interface HarmonicConsultantProps {
  activeDAW: DAWType;
  selectedGenre: SelectedGenre | null;
}

const HarmonicConsultant: React.FC<HarmonicConsultantProps> = ({ activeDAW, selectedGenre }) => {
  const [activeTarget, setActiveTarget] = useState<SaturationTarget>(SAT_TARGETS[0]);
  const [settings, setSettings] = useState<SaturationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (format: 'pdf' | 'docx' | 'png' | 'jpg') => {
    if (!settings) return;
    const title = `Harmonic Profile: ${activeTarget.name} - ${selectedGenre?.sub}`;
    const filename = `harmonic_${activeTarget.id}_${Date.now()}`;

    if (format === 'pdf' || format === 'docx') {
      const sections = [
        { heading: 'Processing Type', content: settings.type },
        { heading: 'Harmonic Content', content: settings.harmonics },
        { heading: 'Parameters', content: `Drive: ${settings.drive}\nMix: ${settings.mix}\nTone: ${settings.tone}\nOversampling: ${settings.oversampling}` },
        { heading: 'Technical Logic', content: settings.logic }
      ];
      if (format === 'pdf') await exportToPDF(title, sections, filename);
      else await exportToDocx(title, sections, filename);
    } else {
      await exportToImage('harmonic-rack-container', format, filename);
    }
  };

  const consultHarmonics = async (target: SaturationTarget) => {
    if (!selectedGenre) return;
    setIsLoading(true);
    setSettings(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const daw = DAW_PROFILES[activeDAW];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a Harmonic Enhancement Specialist. Provide professional saturation and harmonic distortion guidance for "${target.name}" in the genre of "${selectedGenre.sub}" (${selectedGenre.cat}). 
        
        The user is working in ${activeDAW}.
        
        DAW CONTEXT:
        - Terminology to use: ${daw.terminology.join(', ')}.
        - Stock saturation/distortion plugins: ${daw.stockPlugins.join(', ')}.
        - ${daw.reasoningInjection}

        Focus on creating "analog warmth," "grit," or "harmonic complexity" using ${activeDAW} tools.
        
        Return ONLY a JSON object with:
        "type": (string, specific plugin or circuit type in ${activeDAW})
        "drive": (string, e.g., "+4 dB" or "35%")
        "mix": (string, e.g., "100%" or "Parallel 20%")
        "tone": (string, e.g., "Warm / Dark" or "Bright / Exciting")
        "oversampling": (string, e.g., "4x" or "Off")
        "harmonics": (string, e.g., "Even-order" or "Odd-order focus")
        "logic": (string, explaining why this enhancement fits this genre and how to achieve it using ${activeDAW} specific workflows).`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      const parsed = JSON.parse(response.text);
      setSettings(parsed);
    } catch (error) {
      console.error("Harmonic Consultant Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGenre) {
      consultHarmonics(activeTarget);
    }
  }, [selectedGenre, activeTarget, activeDAW]);

  const ParameterCard = ({ label, value, colorClass }: { label: string, value: string, colorClass: string }) => (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center group hover:border-orange-500/40 transition-all">
      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">{label}</span>
      <span className={`text-lg font-bold ${colorClass} group-hover:scale-105 transition-transform truncate w-full`}>{value}</span>
    </div>
  );

  if (!selectedGenre) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
        <div className="w-20 h-20 bg-orange-600/10 rounded-full flex items-center justify-center mb-6 border border-orange-500/20">
          <span className="text-4xl">🔥</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Enhancement Lab Offline</h3>
        <p className="text-zinc-500 max-w-md">
          Saturation characteristics are highly genre-dependent. Calibrate your session in the **Assistant Chat** to access the harmonic enhancement engine.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Target Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {SAT_TARGETS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTarget(t)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all whitespace-nowrap ${
              activeTarget.id === t.id
                ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/20'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-orange-500/30 hover:text-orange-200'
            }`}
          >
            <span>{t.icon}</span>
            <span className="text-xs font-bold uppercase tracking-tight">{t.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Saturation Rack */}
        <div id="harmonic-rack-container" className="lg:col-span-8 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md flex flex-col relative overflow-hidden">
          <div className="absolute top-8 right-8 z-50">
            {settings && <ExportMenu onExport={handleExport} />}
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M12 2c1.2 0 2.4.4 3.4 1.2.6.4 1.2.9 1.7 1.5.5.6.9 1.2 1.2 1.9.3.7.5 1.4.5 2.2 0 .8-.2 1.5-.5 2.2-.3.7-.7 1.3-1.2 1.9s-1.1 1.1-1.7 1.5c-1 .8-2.2 1.2-3.4 1.2s-2.4-.4-3.4-1.2c-.6-.4-1.2-.9-1.7-1.5-.5-.6-.9-1.2-1.2-1.9-.3-.7-.5-1.4-.5-2.2 0-.8.2-1.5.5-2.2.3-.7.7-1.3 1.2-1.9s1.1-1.1 1.7-1.5c1-.8 2.2-1.2 3.4-1.2Z"/><path d="M12 14v8"/><path d="M8 18h8"/></svg>
          </div>

          <header className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">{activeDAW} Saturation Protocol</h3>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                {activeTarget.icon} {activeTarget.name} Exciter
              </p>
            </div>
            <div className="text-right pr-20">
               <span className="text-[10px] text-zinc-500 font-bold uppercase">Harmonic Density</span>
               <div className="h-1.5 w-32 bg-zinc-800 rounded-full mt-2 overflow-hidden border border-zinc-700">
                  <div className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 w-3/4 animate-pulse"></div>
               </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col justify-center relative z-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4 opacity-50">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Generating Harmonic Profile...</p>
              </div>
            ) : settings && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in zoom-in-95 duration-300">
                <div className="col-span-2 md:col-span-1 bg-orange-600/10 border border-orange-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                   <span className="text-[10px] text-orange-400 uppercase font-black tracking-widest mb-1">Module / Plugin</span>
                   <span className="text-base font-black text-white">{settings.type}</span>
                </div>
                <ParameterCard label="Input / Drive" value={settings.drive} colorClass="text-orange-400" />
                <ParameterCard label="Mix Blend" value={settings.mix} colorClass="text-yellow-400" />
                <ParameterCard label="Harmonic Bias" value={settings.harmonics} colorClass="text-zinc-200" />
                <ParameterCard label="Tonal Color" value={settings.tone} colorClass="text-zinc-200" />
                <ParameterCard label="Oversampling" value={settings.oversampling} colorClass="text-zinc-400" />
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-between items-center relative z-10">
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-orange-500/30 border border-orange-500/50"></div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">THD Calibration</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-yellow-500/30 border border-yellow-500/50"></div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">DAW Environment: {activeDAW}</span>
               </div>
            </div>
            <div className="text-[10px] font-mono text-zinc-600">
              ALGORITHM: SONIC_HEAT_v4.2
            </div>
          </div>
        </div>

        {/* Insight Section */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md overflow-y-auto custom-scrollbar flex flex-col">
            <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-orange-500/30"></span>
              {activeDAW} Routing Logic
            </h4>
            
            {isLoading ? (
               <div className="space-y-3">
                  <div className="h-4 bg-zinc-800 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-zinc-800 rounded w-[90%] animate-pulse"></div>
                  <div className="h-4 bg-zinc-800 rounded w-[85%] animate-pulse"></div>
               </div>
            ) : settings && (
              <div className="flex-1">
                <p className="text-sm text-zinc-300 leading-relaxed italic mb-8">
                  "{settings.logic}"
                </p>
                
                <div className="bg-orange-950/20 border border-orange-500/20 rounded-2xl p-5">
                   <h5 className="text-[10px] text-orange-400 font-bold uppercase mb-2">Sonic Strategy</h5>
                   <p className="text-[11px] text-zinc-400 leading-relaxed">
                     Applying these {settings.harmonics.toLowerCase()} in ${activeDAW} ensures your {activeTarget.name} has the necessary "weight" to cut through the ${selectedGenre.sub} mix without increasing peak levels.
                   </p>
                </div>
              </div>
            )}
            
            <button 
              className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-zinc-700 active:scale-95"
              onClick={() => consultHarmonics(activeTarget)}
            >
              Recalculate Distortion Matrix
            </button>
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

export default HarmonicConsultant;
