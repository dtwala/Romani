
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { InstrumentSpec, SelectedGenre, DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';

interface InstrumentDatabaseProps {
  activeDAW: DAWType;
  instrumentName: string | null;
  genre: SelectedGenre | null;
}

const InstrumentDatabase: React.FC<InstrumentDatabaseProps> = ({ activeDAW, instrumentName, genre }) => {
  const [spec, setSpec] = useState<InstrumentSpec | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        
        DAW CONTEXT:
        - Terminology: ${daw.terminology.join(', ')}.
        - Stock processing tools: ${daw.stockPlugins.join(', ')}.
        - ${daw.reasoningInjection}

        Focus on surgical technical details that an engineer needs for a professional mix in ${activeDAW}.
        
        Return the data in the following JSON structure:
        {
          "name": "Instrument Name",
          "category": "Instrument Category",
          "fundamental": "Fundamental frequency range (e.g., 80Hz - 200Hz)",
          "roleInGenre": "A deep 2-3 sentence analysis of the instrument's cultural and technical role. Explain specifically how its usage, engineering treatment, and emotional purpose shift between different genres (e.g., how a snare differs in Jazz vs. Modern Trap).",
          "eqSweetSpots": [{"range": "Freq Range", "effect": "Detailed mixing result in ${activeDAW}"}],
          "problemRanges": [{"range": "Freq Range", "effect": "Problem encountered"}],
          "compression": {"ratio": "X:1", "attack": "X ms", "release": "X ms", "notes": "Implementation using ${activeDAW} stock tools"},
          "stereoField": {
            "panning": "Specific panning advice (e.g. 'Center', '50% Left', 'Hard L/R')",
            "width": "Stereo width recommendation (e.g. 'Mono', 'Narrow', 'Wide', '120%')",
            "positioningAdvice": "How to avoid clashing with other elements in ${genre ? genre.sub : 'a mix'}"
          },
          "stereoStrategy": "Detailed panning/width approach for ${activeDAW}",
          "harmonicProfile": "Analysis of harmonic content",
          "transientProfile": {
            "attack": "Detailed analysis of the sound's onset",
            "sustain": "How the energy decays and rings out",
            "decayNotes": "Engineering advice for ${activeDAW} envelope shaping"
          },
          "genreUtility": [
            {"genre": "Genre Name", "role": "How this instrument typically sits in the mix for this genre"}
          ]
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
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Left Column: EQ & Tone */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          {/* Header Card */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <span className="text-9xl font-black">{instrumentName[0]}</span>
            </div>
            
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

          {/* New Prominent: Heritage & Sonic Role */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md relative overflow-hidden border-l-4 border-l-pink-500">
            <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
              Sonic Heritage & Global Role
            </h4>
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-full"></div>
                <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
              </div>
            ) : spec && (
              <div className="animate-in fade-in duration-700">
                <p className="text-[13px] text-zinc-200 leading-relaxed font-medium italic">
                  "{spec.roleInGenre}"
                </p>
                <div className="mt-4 flex items-center gap-4 text-[9px] text-zinc-500 font-bold uppercase tracking-widest border-t border-zinc-800 pt-4">
                  <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-pink-500"></div> Heritage Context</span>
                  <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500"></div> Cultural Utility</span>
                </div>
              </div>
            )}
          </div>

          {/* EQ Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Surgical Sweet Spots
                </h4>
                <div className="space-y-3">
                   {isLoading ? (
                     [...Array(3)].map((_, i) => <div key={i} className="h-12 bg-zinc-800/30 rounded-xl animate-pulse"></div>)
                   ) : spec?.eqSweetSpots.map((spot, i) => (
                     <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex gap-4 items-center group hover:border-emerald-500/30 transition-all">
                        <div className="w-12 text-[10px] font-mono font-bold text-emerald-400 text-right">{spot.range}</div>
                        <div className="text-[11px] text-zinc-400 group-hover:text-zinc-200">{spot.effect}</div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  Problem Frequencies
                </h4>
                <div className="space-y-3">
                   {isLoading ? (
                     [...Array(3)].map((_, i) => <div key={i} className="h-12 bg-zinc-800/30 rounded-xl animate-pulse"></div>)
                   ) : spec?.problemRanges.map((range, i) => (
                     <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex gap-4 items-center group hover:border-red-500/30 transition-all">
                        <div className="w-12 text-[10px] font-mono font-bold text-red-400 text-right">{range.range}</div>
                        <div className="text-[11px] text-zinc-400 group-hover:text-zinc-200">{range.effect}</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Transient Profile */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">{activeDAW} Transient Analysis</h4>
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-zinc-800/30 rounded-xl"></div>
                <div className="h-16 bg-zinc-800/30 rounded-xl"></div>
              </div>
            ) : spec && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700">
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Attack Stage</span>
                  <p className="text-xs text-zinc-300 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 min-h-[60px]">{spec.transientProfile.attack}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Sustain / Decay</span>
                  <p className="text-xs text-zinc-300 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 min-h-[60px]">{spec.transientProfile.sustain}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Envelope Advice</span>
                  <p className="text-xs text-blue-400/80 bg-blue-900/5 p-3 rounded-xl border border-blue-500/10 min-h-[60px] italic">"{spec.transientProfile.decayNotes}"</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamics & Genre Context */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          {/* Stereo Field Advisor */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md">
             <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Stereo Field Advisor
             </h4>
             {isLoading ? (
               <div className="space-y-4 animate-pulse">
                  <div className="h-16 bg-zinc-800/30 rounded-2xl"></div>
                  <div className="h-16 bg-zinc-800/30 rounded-2xl"></div>
               </div>
             ) : spec && (
               <div className="space-y-4 animate-in fade-in duration-700">
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
                  <div className="p-4 bg-emerald-900/5 border border-emerald-500/10 rounded-xl">
                     <p className="text-[11px] text-zinc-400 leading-relaxed italic">"{spec.stereoField.positioningAdvice}"</p>
                  </div>
                  {/* Visual Panning Indicator */}
                  <div className="relative h-1 bg-zinc-800 rounded-full mt-2 mx-2">
                    <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-zinc-600"></div>
                    <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 glow-blue`} 
                         style={{ 
                            left: spec.stereoField.panning.toLowerCase().includes('hard l') ? '5%' : 
                                  spec.stereoField.panning.toLowerCase().includes('hard r') ? '95%' :
                                  spec.stereoField.panning.toLowerCase().includes('center') ? '50%' : 
                                  spec.stereoField.panning.toLowerCase().includes('left') ? '25%' :
                                  spec.stereoField.panning.toLowerCase().includes('right') ? '75%' : '50%' 
                         }}></div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[7px] text-zinc-600 font-bold">L</span>
                      <span className="text-[7px] text-zinc-600 font-bold">C</span>
                      <span className="text-[7px] text-zinc-600 font-bold">R</span>
                    </div>
                  </div>
               </div>
             )}
          </div>

          {/* Compression Specs */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md">
             <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-6">Dynamics Target: {activeDAW}</h4>
             {isLoading ? (
               <div className="space-y-4 animate-pulse">
                  <div className="h-20 bg-zinc-800/30 rounded-2xl"></div>
                  <div className="h-20 bg-zinc-800/30 rounded-2xl"></div>
               </div>
             ) : spec && (
               <div className="space-y-4 animate-in fade-in duration-700">
                  <div className="grid grid-cols-3 gap-2">
                     <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
                        <div className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Ratio</div>
                        <div className="text-sm font-bold text-white">{spec.compression.ratio}</div>
                     </div>
                     <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
                        <div className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Attack</div>
                        <div className="text-sm font-bold text-white">{spec.compression.attack}</div>
                     </div>
                     <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
                        <div className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Release</div>
                        <div className="text-sm font-bold text-white">{spec.compression.release}</div>
                     </div>
                  </div>
                  <div className="p-4 bg-orange-900/5 border border-orange-500/10 rounded-xl">
                     <p className="text-[11px] text-zinc-400 leading-relaxed italic">"{spec.compression.notes}"</p>
                  </div>
               </div>
             )}
          </div>

          {/* Genre Utility */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md">
            <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4">Genre Role & Utility</h4>
            <div className="space-y-3">
              {isLoading ? (
                [...Array(2)].map((_, i) => <div key={i} className="h-16 bg-zinc-800/30 rounded-xl animate-pulse"></div>)
              ) : spec?.genreUtility.map((util, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 group hover:border-purple-500/30 transition-all">
                  <div className="text-[9px] font-black text-purple-400 uppercase mb-1">{util.genre}</div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed group-hover:text-zinc-200">{util.role}</div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={fetchSpecs}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            Update Technical Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstrumentDatabase;
