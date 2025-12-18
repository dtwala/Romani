
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { DAWType, SelectedGenre } from '../types';
import { DAW_PROFILES } from '../data/daws';
import { PLUGIN_CATALOG, SONIC_GOALS } from '../data/plugins';
import { INSTRUMENT_CATEGORIES } from '../data/instruments';
import ExportMenu from './ExportMenu';
import { exportToPDF, exportToDocx, exportToImage } from '../utils/exportUtils';

interface PluginRecommendation {
  stockPlugin: {
    name: string;
    settings: string;
    why: string;
  };
  proAlternative: {
    name: string;
    brand: string;
    why: string;
  };
  workflowTip: string;
}

interface PluginAdvisorProps {
  activeDAW: DAWType;
  selectedGenre: SelectedGenre | null;
}

const PluginAdvisor: React.FC<PluginAdvisorProps> = ({ activeDAW, selectedGenre }) => {
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [recommendation, setRecommendation] = useState<PluginRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const daw = DAW_PROFILES[activeDAW];

  const handleExport = async (format: 'pdf' | 'docx' | 'png' | 'jpg') => {
    if (!recommendation) return;
    
    const title = `Processing Chain: ${selectedInstrument} - ${selectedGoal}`;
    const sections = [
      { heading: `${activeDAW} Stock Rec`, content: `${recommendation.stockPlugin.name}\nSettings: ${recommendation.stockPlugin.settings}\nReason: ${recommendation.stockPlugin.why}` },
      { heading: `Pro Alternative`, content: `${recommendation.proAlternative.name} (${recommendation.proAlternative.brand})\nReason: ${recommendation.proAlternative.why}` },
      { heading: `Workflow Implementation`, content: recommendation.workflowTip }
    ];

    if (format === 'pdf') await exportToPDF(title, sections, 'plugin_report');
    else if (format === 'docx') await exportToDocx(title, sections, 'plugin_report');
    else await exportToImage('plugin-result-card', format, 'plugin_chain');
  };

  const getRecommendation = async () => {
    if (!selectedInstrument || !selectedGoal) return;
    setIsLoading(true);
    setRecommendation(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a world-class Studio Technology Consultant and System Architect. 
        A user needs to achieve the sonic goal of "${selectedGoal}" on the instrument "${selectedInstrument}" in the genre "${selectedGenre?.sub || 'General'}".
        The user is working in ${activeDAW}.

        DAW CONTEXT (MANDATORY INTEGRATION):
        - Workflow Focus: ${daw.workflowFocus}
        - Technical Logic: ${daw.reasoningInjection}
        - Core Terminology: ${daw.terminology.join(', ')}

        Recommend:
        1. A specific STOCK plugin from ${activeDAW} (from this list: ${daw.stockPlugins.join(', ')}) with suggested technical settings.
        2. A premium 3rd party VST alternative (e.g. FabFilter, Waves, Soundtoys, UAD) that is an industry standard for this task.
        3. A professional workflow tip that is EXPLICITLY tailored to the ${activeDAW} environment.

        CRITICAL REQUIREMENT for "workflowTip":
        The tip MUST bridge the gap between the plugin's function and the DAW's specific "Workflow Focus" and "Technical Logic". 
        Explain EXACTLY how to utilize the tool within ${activeDAW}'s unique architecture. 

        Return ONLY a JSON object:
        {
          "stockPlugin": { "name": "Exact Name", "settings": "Specific values", "why": "Explanation" },
          "proAlternative": { "name": "Plugin Name", "brand": "Brand Name", "why": "Explanation" },
          "workflowTip": "A highly detailed, technical engineering tip specific to ${activeDAW} and the recommended processing."
        }`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      const data = JSON.parse(response.text);
      setRecommendation(data);
    } catch (err) {
      console.error("Plugin Advisor Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Smart Recommender
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-2">Instrument Source</label>
                <select 
                  value={selectedInstrument}
                  onChange={(e) => setSelectedInstrument(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Source...</option>
                  {INSTRUMENT_CATEGORIES.map(cat => (
                    <optgroup key={cat.name} label={cat.name}>
                      {cat.items.map(item => <option key={item} value={item}>{item}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-2">Sonic Goal</label>
                <select 
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Desired Result...</option>
                  {SONIC_GOALS.map(goal => <option key={goal} value={goal}>{goal}</option>)}
                </select>
              </div>

              <button 
                onClick={getRecommendation}
                disabled={!selectedInstrument || !selectedGoal || isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] mt-2"
              >
                {isLoading ? "Consulting Archives..." : "Generate Signal Chain"}
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md">
             <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-3">Active DAW Logic</h4>
             <div className="space-y-3">
                <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                   <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Workflow Focus</p>
                   <p className="text-[11px] text-zinc-300 leading-relaxed italic">"{daw.workflowFocus}"</p>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md min-h-[400px] flex flex-col relative overflow-hidden">
          <div className="absolute top-4 right-4 z-50">
            {recommendation && <ExportMenu onExport={handleExport} />}
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Architecting Processing for {activeDAW}...</p>
            </div>
          ) : recommendation ? (
            <div id="plugin-result-card" className="animate-in fade-in zoom-in-95 duration-500 space-y-8 flex-1 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 border-l-4 border-l-blue-500 shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{activeDAW} Stock</span>
                    <span className="w-8 h-8 rounded-lg bg-blue-900/20 flex items-center justify-center text-sm">🛠️</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1">{recommendation.stockPlugin.name}</h4>
                  <div className="text-[9px] text-zinc-500 uppercase font-black mb-3">Implementation Parameters</div>
                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg font-mono text-blue-400 text-[11px] mb-4 shadow-inner">
                    {recommendation.stockPlugin.settings}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed italic">"{recommendation.stockPlugin.why}"</p>
                </div>

                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 border-l-4 border-l-purple-500 shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] text-purple-500 font-black uppercase tracking-widest">Industry Standard</span>
                    <span className="w-8 h-8 rounded-lg bg-purple-900/20 flex items-center justify-center text-sm">💎</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-0.5">{recommendation.proAlternative.name}</h4>
                  <div className="text-[10px] text-purple-400 font-black mb-4 uppercase tracking-wider">{recommendation.proAlternative.brand}</div>
                  <p className="text-xs text-zinc-400 leading-relaxed italic">"{recommendation.proAlternative.why}"</p>
                </div>
              </div>

              <div className="p-6 bg-emerald-900/5 border border-emerald-500/20 rounded-2xl flex items-start gap-5 mt-auto shadow-inner">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-lg">💡</div>
                 <div>
                   <h5 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                     Tailored {activeDAW} Workflow Tip
                   </h5>
                   <p className="text-sm text-zinc-200 font-medium leading-relaxed italic">"{recommendation.workflowTip}"</p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
               <div className="w-24 h-24 bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-2">
                 <span className="text-5xl">🔌</span>
               </div>
               <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Signal Analysis Ready</h3>
               <p className="text-sm text-zinc-500 max-w-[320px]">Select a source instrument and a target sonic goal to generate a professional {activeDAW} signal chain.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PluginAdvisor;
