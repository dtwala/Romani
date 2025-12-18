
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SelectedGenre, DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';
import ExportMenu from './ExportMenu';
import { exportToPDF, exportToDocx } from '../utils/exportUtils';

interface SampleTechnique {
  name: string;
  description: string;
  icon: string;
  proTip: string;
}

const TECHNIQUES: SampleTechnique[] = [
  { name: 'Manual Chopping', description: 'Cutting samples into rhythmic segments for MPC-style retriggering.', icon: '🔪', proTip: 'Always chop on the zero-crossing to avoid clicks and pops.' },
  { name: 'Pitch-Shifting', description: 'Altering the pitch without changing tempo (or vice versa).', icon: '🎢', proTip: 'Shift down -12 semitones to find hidden bass frequencies in soul records.' },
  { name: 'Bit-Crushing', description: 'Reducing resolution for lo-fi, 12-bit grit.', icon: '👾', proTip: 'Apply before EQ to sculpt the newly generated harmonic distortion.' },
  { name: 'Reversing', description: 'Creating otherworldly textures by flipping audio tails.', icon: '◀️', proTip: 'Reverse only the reverb tail of a vocal for a "ghostly" lead-in.' }
];

interface SampleBlueprint {
  sourceRecommendation: string;
  choppingLogic: string;
  processingStack: string;
  legalAdvice: string;
}

const SampleLab: React.FC<{ selectedGenre: SelectedGenre | null, activeDAW: DAWType }> = ({ selectedGenre, activeDAW }) => {
  const [blueprint, setBlueprint] = useState<SampleBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);

  const handleExport = async (format: 'pdf' | 'docx' | 'png' | 'jpg') => {
    if (!blueprint) return;
    const title = `Sampling Blueprint - ${selectedGenre?.sub} - ${activeDAW}`;
    const sections = [
      { heading: 'Source Recommendation', content: blueprint.sourceRecommendation },
      { heading: 'Chopping Strategy', content: blueprint.choppingLogic },
      { heading: 'Processing Stack', content: blueprint.processingStack },
      { heading: 'Legal Advice', content: blueprint.legalAdvice }
    ];
    if (format === 'pdf') await exportToPDF(title, sections, 'sampling_blueprint');
    else if (format === 'docx') await exportToDocx(title, sections, 'sampling_blueprint');
    else alert("Visual export for blueprints is coming soon.");
  };

  const generateBlueprint = async () => {
    if (!selectedGenre) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a legendary crate-digging producer. Provide a "Sampling Blueprint" for the genre ${selectedGenre.sub} in ${activeDAW}. 
        Return ONLY a JSON object:
        {
          "sourceRecommendation": "Where to look for samples (era, style)",
          "choppingLogic": "How to slice the audio for this specific groove",
          "processingStack": "Plugin chain in ${activeDAW} to get the vibe",
          "legalAdvice": "Quick tip on sample clearance for this style"
        }`,
        config: { responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 4000 } }
      });
      setBlueprint(JSON.parse(response.text));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Chopping Area */}
        <div className="lg:col-span-7 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md">
           <header className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Rhythmic Fragmentation</h3>
                 <p className="text-xl font-bold text-white uppercase tracking-tight">Virtual Pad Matrix</p>
              </div>
              <div className="text-[10px] font-mono text-zinc-600 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">12-BIT EMULATION</div>
           </header>

           <div className="grid grid-cols-4 gap-4 aspect-square max-w-md mx-auto">
              {[...Array(16)].map((_, i) => (
                <button
                  key={i}
                  onMouseDown={() => setActivePad(i)}
                  onMouseUp={() => setActivePad(null)}
                  className={`aspect-square rounded-2xl border-b-4 transition-all flex flex-col items-center justify-center relative overflow-hidden group ${
                    activePad === i 
                      ? 'bg-emerald-500 border-emerald-700 translate-y-1' 
                      : 'bg-zinc-800 border-zinc-950 hover:bg-zinc-700'
                  }`}
                >
                   <span className={`text-[10px] font-black absolute top-2 left-3 ${activePad === i ? 'text-white' : 'text-zinc-600'}`}>
                    {String(i + 1).padStart(2, '0')}
                   </span>
                   <div className={`w-8 h-px mb-1 transition-colors ${activePad === i ? 'bg-white' : 'bg-zinc-700 group-hover:bg-emerald-500'}`}></div>
                   <span className={`text-[9px] font-bold uppercase tracking-tighter ${activePad === i ? 'text-white' : 'text-zinc-500'}`}>
                    Slice {i+1}
                   </span>
                </button>
              ))}
           </div>
        </div>

        {/* Blueprint & AI Advice */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md flex-1 relative">
              <div className="absolute top-8 right-8">
                 {blueprint && <ExportMenu onExport={handleExport} />}
              </div>
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Sampling Intelligence
              </h4>

              {selectedGenre ? (
                <div className="space-y-6">
                   {!blueprint && !isLoading ? (
                     <div className="text-center py-12">
                        <p className="text-sm text-zinc-500 mb-6 italic">"The art of sampling is the art of re-contextualization."</p>
                        <button 
                          onClick={generateBlueprint}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                        >
                          Synthesize Genre Blueprint
                        </button>
                     </div>
                   ) : isLoading ? (
                     <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-20 bg-zinc-800/30 rounded-2xl animate-pulse"></div>
                        ))}
                     </div>
                   ) : blueprint && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl border-l-4 border-l-emerald-500">
                           <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Source Crate</span>
                           <p className="text-xs text-zinc-300 leading-relaxed italic">"{blueprint.sourceRecommendation}"</p>
                        </div>
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl border-l-4 border-l-blue-500">
                           <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Chopping Strategy</span>
                           <p className="text-xs text-zinc-300 leading-relaxed">{blueprint.choppingLogic}</p>
                        </div>
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl border-l-4 border-l-purple-500">
                           <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Sonic Chain ({activeDAW})</span>
                           <p className="text-xs text-zinc-300 leading-relaxed">{blueprint.processingStack}</p>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center gap-3">
                           <span className="text-xl">⚖️</span>
                           <p className="text-[10px] text-zinc-500 italic font-medium leading-tight">{blueprint.legalAdvice}</p>
                        </div>
                     </div>
                   )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center opacity-30 py-12">
                   <span className="text-5xl mb-4">💿</span>
                   <p className="text-xs font-bold uppercase tracking-widest max-w-[200px]">Calibrate Genre to Unlock Blueprint</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Techniques Guide */}
      <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md">
         <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8">Professional Manipulation Techniques</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TECHNIQUES.map(tech => (
              <div key={tech.name} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 group hover:border-emerald-500/30 transition-all">
                 <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110 origin-left">{tech.icon}</div>
                 <h5 className="text-sm font-bold text-white mb-2 uppercase tracking-tight">{tech.name}</h5>
                 <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">{tech.description}</p>
                 <div className="pt-4 border-t border-zinc-800">
                    <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-1 block">Pro Tip</span>
                    <p className="text-[10px] text-zinc-400 italic">"{tech.proTip}"</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default SampleLab;
