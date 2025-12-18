
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { InstrumentSpec, SelectedGenre, DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';
import ExportMenu from './ExportMenu';
import { exportToPDF, exportToDocx, exportToImage } from '../utils/exportUtils';

interface InstrumentDatabaseProps {
  activeDAW: DAWType;
  instrumentName: string | null;
  genre: SelectedGenre | null;
}

const InstrumentDatabase: React.FC<InstrumentDatabaseProps> = ({ activeDAW, instrumentName, genre }) => {
  const [spec, setSpec] = useState<InstrumentSpec | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (format: 'pdf' | 'docx' | 'png' | 'jpg') => {
    if (!spec) return;
    
    const title = `Technical Spec: ${spec.name} (${spec.category})`;
    const sections = [
      { heading: 'Acoustic Property', content: `Fundamental: ${spec.fundamental}\nHarmonic Profile: ${spec.harmonicProfile}` },
      { heading: 'Cultural & Sonic Role', content: spec.roleInGenre },
      { heading: 'EQ Strategy', content: spec.eqSweetSpots.map(s => `${s.range}: ${s.effect}`).join('\n') },
      { heading: 'Dynamics Architecture', content: `Ratio: ${spec.compression.ratio}\nAttack: ${spec.compression.attack}\nRelease: ${spec.compression.release}\nNotes: ${spec.compression.notes}\nImpact: ${spec.compression.impact}` },
      { heading: 'Spatial Positioning', content: `Panning: ${spec.stereoField.panning}\nWidth: ${spec.stereoField.width}\nAdvice: ${spec.stereoField.positioningAdvice}` }
    ];

    if (format === 'pdf') await exportToPDF(title, sections, `spec_${spec.name.toLowerCase()}`);
    else if (format === 'docx') await exportToDocx(title, sections, `spec_${spec.name.toLowerCase()}`);
    else if (format === 'png' || format === 'jpg') await exportToImage('instrument-spec-container', format, `spec_${spec.name.toLowerCase()}`);
  };

  const fetchSpecs = async () => {
    if (!instrumentName) return;
    setIsLoading(true);
    setSpec(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const daw = DAW_PROFILES[activeDAW];

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a Studio Technical Librarian. Provide an exhaustive engineering specification for the instrument "${instrumentName}" ${genre ? `within the context of the genre "${genre.sub}"` : ''}. 
        The user is using ${activeDAW}.
        
        Return the data in the following JSON structure:
        {
          "name": "${instrumentName}",
          "category": "Instrument Category",
          "fundamental": "Fundamental range",
          "roleInGenre": "Cultural/Sonic Role",
          "eqSweetSpots": [{"range": "Freq", "effect": "Mixing result"}],
          "problemRanges": [{"range": "Freq", "effect": "Encountered issue"}],
          "compression": {
            "ratio": "X:1", 
            "attack": "Xms", 
            "release": "Xms", 
            "notes": "Implementation using ${activeDAW} tools",
            "impact": "Detail exactly how these specific compression settings (ratio, attack, release) allow this instrument to cut through or sit in a ${genre?.sub || 'modern'} mix."
          },
          "stereoField": {
            "panning": "Advice",
            "width": "Recommendation",
            "positioningAdvice": "Clash avoidance"
          },
          "harmonicProfile": "Texture analysis",
          "transientProfile": { "attack": "Onset", "sustain": "Decay", "decayNotes": "Advice" },
          "genreUtility": [{"genre": "Name", "role": "How it sits"}]
        }`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      const data = JSON.parse(response.text);
      setSpec(data);
    } catch (err) {
      console.error("Instrument Lab Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecs();
  }, [instrumentName, genre, activeDAW]);

  if (!instrumentName) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
        <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
          <span className="text-4xl">🗂️</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Instrument Database Offline</h3>
        <p className="text-zinc-500 max-w-md">
          Select an instrument from the sidebar dropdown to access surgical engineering specifications calibrated for {activeDAW}.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 relative">
      <div className="absolute top-0 right-0 z-50">
        {spec && <ExportMenu onExport={handleExport} />}
      </div>

      <div id="instrument-spec-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden p-4">
        {/* Left Column: EQ & Tone */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          {/* Header Card */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
            <header className="relative z-10">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{activeDAW} Technical Spec Sheet</h3>
              <h2 className="text-4xl font-black text-white mb-2">{instrumentName}</h2>
              <div className="flex gap-2">
                 <span className="px-2 py-0.5 bg-blue-900/30 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase">{spec?.category || 'Analyzing...'}</span>
                 {genre && <span className="px-2 py-0.5 bg-purple-900/30 border border-purple-500/20 rounded text-[10px] font-bold text-purple-400 uppercase">{genre.sub} Profile</span>}
              </div>
            </header>

            <div className="mt-8 grid grid-cols-2 gap-8 relative z-10">
               <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Fundamental Pulse</span>
                  <span className="text-lg font-mono text-blue-400 font-bold">{spec?.fundamental || 'Calculating...'}</span>
               </div>
               <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Harmonic Profile</span>
                  <span className="text-xs text-zinc-300 leading-relaxed block">{spec?.harmonicProfile || 'Analyzing textures...'}</span>
               </div>
            </div>
          </div>

          {/* Heritage Section */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md relative overflow-hidden border-l-4 border-l-pink-500 shadow-xl">
            <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
              Sonic Heritage & Global Role
            </h4>
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-full"></div>
                <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
              </div>
            ) : spec && (
              <p className="text-[13px] text-zinc-200 leading-relaxed font-medium italic">"{spec.roleInGenre}"</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md shadow-lg">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Surgical Sweet Spots</h4>
                <div className="space-y-3">
                   {spec?.eqSweetSpots.map((spot, i) => (
                     <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex gap-4 items-center">
                        <div className="w-12 text-[10px] font-mono font-bold text-emerald-400 text-right">{spot.range}</div>
                        <div className="text-[11px] text-zinc-400">{spot.effect}</div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md shadow-lg">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Problem Frequencies</h4>
                <div className="space-y-3">
                   {spec?.problemRanges.map((range, i) => (
                     <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex gap-4 items-center">
                        <div className="w-12 text-[10px] font-mono font-bold text-red-400 text-right">{range.range}</div>
                        <div className="text-[11px] text-zinc-400">{range.effect}</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Dynamics & Space */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          {/* Dynamics Target Card */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md shadow-lg border-t-4 border-t-orange-500">
             <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-6">Dynamics Target</h4>
             {isLoading ? (
               <div className="space-y-4 animate-pulse">
                 <div className="h-12 bg-zinc-800 rounded-xl"></div>
                 <div className="h-32 bg-zinc-800 rounded-xl"></div>
               </div>
             ) : spec && (
               <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-2">
                     <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center group hover:border-orange-500/30 transition-all">
                        <div className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Ratio</div>
                        <div className="text-sm font-bold text-white">{spec.compression.ratio}</div>
                     </div>
                     <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center group hover:border-orange-500/30 transition-all">
                        <div className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Attack</div>
                        <div className="text-sm font-bold text-white">{spec.compression.attack}</div>
                     </div>
                     <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center group hover:border-orange-500/30 transition-all">
                        <div className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Release</div>
                        <div className="text-sm font-bold text-white">{spec.compression.release}</div>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-[9px] text-zinc-400 uppercase font-black mb-2 tracking-widest">Impact on Presence</h5>
                      <div className="p-4 bg-orange-900/10 border border-orange-500/20 rounded-2xl italic text-[11px] text-zinc-200 leading-relaxed shadow-inner">
                        "{spec.compression.impact}"
                      </div>
                    </div>

                    <div>
                      <h5 className="text-[9px] text-zinc-400 uppercase font-black mb-2 tracking-widest">Implementation Note</h5>
                      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-[10px] text-zinc-400 leading-relaxed">
                        {spec.compression.notes}
                      </div>
                    </div>
                  </div>
               </div>
             )}
          </div>

          {/* Stereo Field Advisor Card */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md shadow-lg border-t-4 border-t-emerald-500">
             <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6">Stereo Field Advisor</h4>
             {isLoading ? (
               <div className="space-y-4 animate-pulse">
                 <div className="h-12 bg-zinc-800 rounded-xl"></div>
                 <div className="h-20 bg-zinc-800 rounded-xl"></div>
               </div>
             ) : spec && (
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                        <div className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Target Panning</div>
                        <div className="text-xs font-bold text-white">{spec.stereoField.panning}</div>
                     </div>
                     <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                        <div className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Stereo Width</div>
                        <div className="text-xs font-bold text-white">{spec.stereoField.width}</div>
                     </div>
                  </div>
                  <div className="p-4 bg-emerald-900/5 border border-emerald-500/10 rounded-xl italic text-[11px] text-zinc-400 leading-relaxed">
                     "{spec.stereoField.positioningAdvice}"
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstrumentDatabase;
