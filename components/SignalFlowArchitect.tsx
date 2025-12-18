
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SelectedGenre, DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';
import ExportMenu from './ExportMenu';
import { exportToPDF, exportToDocx } from '../utils/exportUtils';

interface ProcessingUnit {
  id: string;
  name: string;
  type: 'Subtractive' | 'Dynamics' | 'Tonal' | 'Spatial' | 'Utility';
  settings: string;
  logic: string;
}

interface ProcessingTarget {
  id: string;
  name: string;
  icon: string;
}

const TARGETS: ProcessingTarget[] = [
  { id: 'vocals', name: 'Lead Vocals', icon: '🎤' },
  { id: 'kick', name: 'Kick Drum', icon: '🥁' },
  { id: 'bass', name: 'Electric Bass', icon: '🎸' },
  { id: 'synths', name: 'Synths/Guitars', icon: '🎹' },
  { id: 'master', name: 'Master Bus', icon: '🎚️' },
];

interface SignalFlowArchitectProps {
  activeDAW: DAWType;
  selectedGenre: SelectedGenre | null;
}

const SignalFlowArchitect: React.FC<SignalFlowArchitectProps> = ({ activeDAW, selectedGenre }) => {
  const [activeTarget, setActiveTarget] = useState<ProcessingTarget>(TARGETS[TARGETS.length - 1]);
  const [chain, setChain] = useState<ProcessingUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<ProcessingUnit | null>(null);

  const handleExport = async (format: 'pdf' | 'docx' | 'png' | 'jpg') => {
    if (chain.length === 0) return;
    const title = `Signal Flow Report: ${activeTarget.name} - ${selectedGenre?.sub}`;
    const sections = chain.map((unit, idx) => ({
      heading: `${idx + 1}. ${unit.name} (${unit.type})`,
      content: `Settings: ${unit.settings}\nArchitecture Logic: ${unit.logic}`
    }));
    if (format === 'pdf') await exportToPDF(title, sections, 'signal_flow_report');
    else if (format === 'docx') await exportToDocx(title, sections, 'signal_flow_report');
    else alert("Rack image export developing.");
  };

  const generateChain = async (target: ProcessingTarget) => {
    if (!selectedGenre) return;
    setIsLoading(true);
    setChain([]);
    setSelectedUnit(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const daw = DAW_PROFILES[activeDAW];

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Architect a professional studio signal flow for ${target.name} in the genre of ${selectedGenre.sub} (${selectedGenre.cat}). 
        The user is working in ${activeDAW}.
        
        DAW CONTEXT:
        - Incorporate these stock plugins where appropriate: ${daw.stockPlugins.join(', ')}.
        - Use routing logic specific to ${activeDAW} (${daw.workflowFocus}).
        - Terminology: ${daw.terminology.join(', ')}.

        Provide the output as a JSON array of objects. Each object MUST have:
        - "name": The name of the processor (e.g., "Logic Compressor - VCA 160 mode" or "Ableton EQ Eight").
        - "type": Choose one from: "Subtractive", "Dynamics", "Tonal", "Spatial", "Utility".
        - "settings": Specific technical settings (Threshold, Ratio, Q, etc.).
        - "logic": Why this processor is placed here in the ${activeDAW} signal chain for this genre.
        
        Provide exactly 5 key steps in the chain.`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      const parsedChain = JSON.parse(response.text);
      const chainWithIds = parsedChain.map((u: any, idx: number) => ({
        ...u,
        id: `unit-${idx}`
      }));
      setChain(chainWithIds);
      setSelectedUnit(chainWithIds[0]);
    } catch (err) {
      console.error("Signal flow error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGenre) {
      generateChain(activeTarget);
    }
  }, [selectedGenre, activeTarget, activeDAW]);

  if (!selectedGenre) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
        <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
          <span className="text-4xl">📉</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Signal Chain Offline</h3>
        <p className="text-zinc-500 max-w-md">
          Studio routing is dependent on your genre profile. Head to the **Assistant Chat** to calibrate your session before architecting your flow.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        {/* Target Selector */}
        <div className="flex gap-2 p-1 bg-zinc-950/60 rounded-2xl border border-zinc-800 w-fit">
          {TARGETS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTarget(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTarget.id === t.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>{t.icon}</span> {t.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <ExportMenu onExport={handleExport} />
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-900/50 px-3 py-2 rounded-lg border border-zinc-800">
             Engine: {activeDAW} Signal Logic
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Rack */}
        <div className="lg:col-span-1 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md flex flex-col">
          <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Serial Signal Path</h3>
          
          <div className="flex-1 flex flex-col items-center space-y-4">
             {isLoading ? (
               [...Array(5)].map((_, i) => (
                 <div key={i} className="w-full h-16 bg-zinc-800/30 rounded-xl animate-pulse"></div>
               ))
             ) : (
               chain.map((unit, idx) => (
                 <React.Fragment key={unit.id}>
                    <button
                      onClick={() => setSelectedUnit(unit)}
                      className={`w-full p-4 rounded-xl border transition-all text-left group relative ${
                        selectedUnit?.id === unit.id 
                          ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500 font-mono font-bold">{idx + 1}.</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded border ${
                          unit.type === 'Dynamics' ? 'border-red-500/30 text-red-400 bg-red-500/5' :
                          unit.type === 'Spatial' ? 'border-purple-500/30 text-purple-400 bg-purple-500/5' :
                          unit.type === 'Subtractive' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' :
                          'border-blue-500/30 text-blue-400 bg-blue-500/5'
                        }`}>
                          {unit.type.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{unit.name}</h4>
                    </button>
                    {idx < chain.length - 1 && (
                      <div className="w-px h-4 bg-zinc-800 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                      </div>
                    )}
                 </React.Fragment>
               ))
             )}
          </div>
        </div>

        {/* Breakdown & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md h-full flex flex-col">
            {selectedUnit ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
                <header className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xl">
                      {selectedUnit.type === 'Dynamics' ? '🗜️' : 
                       selectedUnit.type === 'Spatial' ? '🌊' : 
                       selectedUnit.type === 'Subtractive' ? '📈' : '🎚️'}
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedUnit.name}</h2>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Category: {selectedUnit.type} Processor</p>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">{activeDAW} Parameters</h4>
                      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 font-mono text-blue-400 text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
                        {selectedUnit.settings}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-3">Architectural Logic</h4>
                      <div className="bg-purple-900/5 border border-purple-500/20 rounded-2xl p-6 text-zinc-300 text-sm leading-relaxed italic">
                        "{selectedUnit.logic}"
                      </div>
                    </div>
                    
                    <div className="p-6 bg-zinc-800/30 border border-zinc-700 rounded-2xl">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Studio Routing</p>
                      <p className="text-xs text-zinc-400">
                        In {activeDAW}, ensure this {selectedUnit.type} unit is placed on the {activeTarget.id === 'master' ? 'Master Fader' : 'Track Insert'} and not a global return unless specify for parallel processing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Optimal Phase Correlation</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-1 bg-blue-500 rounded-full"></div>
                    <div className="w-8 h-1 bg-zinc-800 rounded-full"></div>
                    <div className="w-8 h-1 bg-zinc-800 rounded-full"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <p className="mt-4 text-sm font-bold uppercase tracking-widest">Select a rack unit to view parameters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalFlowArchitect;
