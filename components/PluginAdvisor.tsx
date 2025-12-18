
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { DAWType, SelectedGenre } from '../types';
import { DAW_PROFILES } from '../data/daws';
import { PLUGIN_CATALOG, SONIC_GOALS } from '../data/plugins';
import { INSTRUMENT_CATEGORIES } from '../data/instruments';

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

  const getRecommendation = async () => {
    if (!selectedInstrument || !selectedGoal) return;
    setIsLoading(true);
    setRecommendation(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const daw = DAW_PROFILES[activeDAW];

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a world-class Studio Technology Consultant and System Architect. 
        A user needs to achieve the sonic goal of "${selectedGoal}" on the instrument "${selectedInstrument}" in the genre "${selectedGenre?.sub || 'General'}".
        The user is working in ${activeDAW}.

        DAW CONTEXT:
        - Workflow Focus: ${daw.workflowFocus}
        - Technical Logic: ${daw.reasoningInjection}
        - Core Terminology: ${daw.terminology.join(', ')}

        Recommend:
        1. A specific STOCK plugin from ${activeDAW} (from this list: ${daw.stockPlugins.join(', ')}) with suggested settings.
        2. A premium 3rd party VST alternative (e.g. FabFilter, Waves, Soundtoys, UAD) that is an industry standard for this task.
        3. A professional workflow tip that is EXPLICITLY tailored to the ${activeDAW} environment.

        CRITICAL: The "workflowTip" MUST integrate the DAW's specific "Workflow Focus" and "Technical Logic" provided above. Explain how these recommended tools should be utilized within ${activeDAW}'s unique architecture (e.g., specific routing strategies, utilizing ${activeDAW}-specific features, or shortcut-driven efficiencies).

        Return ONLY a JSON object:
        {
          "stockPlugin": { "name": "Exact Name", "settings": "Specific values", "why": "Explanation" },
          "proAlternative": { "name": "Plugin Name", "brand": "Brand Name", "why": "Explanation" },
          "workflowTip": "One highly detailed professional engineering tip specific to ${activeDAW} workflow and this specific task"
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
      {/* Smart Recommender Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Smart Recommender
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-2">Instrument</label>
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
                {isLoading ? "Consulting Archives..." : "Get Recommendations"}
              </button>
            </div>
          </div>

          <div className="p-4 bg-blue-900/5 border border-blue-500/10 rounded-2xl text-[10px] text-zinc-500 leading-relaxed italic">
            "The right tool choice isn't just about sound; it's about how the interface and algorithm respond to the transient profile of your source."
          </div>
        </div>

        <div className="lg:col-span-8 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md min-h-[400px] flex flex-col relative overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Architecting Processing Chain for {activeDAW}...</p>
            </div>
          ) : recommendation ? (
            <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stock Rec */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{activeDAW} Stock</span>
                    <span className="w-6 h-6 rounded-lg bg-blue-900/20 flex items-center justify-center text-xs">🛠️</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{recommendation.stockPlugin.name}</h4>
                  <div className="text-[10px] text-zinc-500 uppercase font-black mb-1">Target Parameters</div>
                  <div className="bg-zinc-900 p-3 rounded-lg font-mono text-blue-400 text-[11px] mb-4">{recommendation.stockPlugin.settings}</div>
                  <p className="text-xs text-zinc-400 leading-relaxed italic">"{recommendation.stockPlugin.why}"</p>
                </div>

                {/* Pro Alternative */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 border-l-4 border-l-purple-500">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] text-purple-500 font-black uppercase tracking-widest">Industry Pro</span>
                    <span className="w-6 h-6 rounded-lg bg-purple-900/20 flex items-center justify-center text-xs">💎</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">{recommendation.proAlternative.name}</h4>
                  <div className="text-[10px] text-purple-400 font-black mb-4 uppercase">{recommendation.proAlternative.brand}</div>
                  <p className="text-xs text-zinc-400 leading-relaxed italic">"{recommendation.proAlternative.why}"</p>
                </div>
              </div>

              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-emerald-900/20 border border-emerald-500/20 flex items-center justify-center text-2xl">💡</div>
                 <div>
                   <h5 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Professional Workflow Tip</h5>
                   <p className="text-sm text-zinc-300 italic">"{recommendation.workflowTip}"</p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
               <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                 <span className="text-4xl">🔌</span>
               </div>
               <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">Plugin Intelligence Offline</h3>
               <p className="text-sm text-zinc-500 max-w-[280px]">Select an instrument and a sonic goal to generate professional technical recommendations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Explorer */}
      <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md">
        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-8 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Studio Effect Catalogue
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {PLUGIN_CATALOG.map(cat => (
             <div 
                key={cat.name}
                onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer group ${
                  activeCategory === cat.name 
                    ? 'bg-emerald-600/10 border-emerald-500 shadow-lg shadow-emerald-900/10' 
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
             >
               <div className="text-3xl mb-4 transition-transform group-hover:scale-110">{cat.icon}</div>
               <h4 className="text-lg font-bold text-white mb-2">{cat.name}</h4>
               <p className="text-xs text-zinc-500 leading-relaxed mb-4">{cat.description}</p>
               
               {activeCategory === cat.name && (
                 <div className="space-y-4 pt-4 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2">
                    {cat.commonTypes.map(type => (
                      <div key={type.name}>
                        <div className="text-[9px] font-black text-emerald-400 uppercase mb-1">{type.name}</div>
                        <p className="text-[10px] text-zinc-400 mb-2 leading-snug">{type.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {type.examples.map(ex => (
                            <span key={ex} className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[8px] text-zinc-500 font-bold">{ex}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                 </div>
               )}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default PluginAdvisor;
