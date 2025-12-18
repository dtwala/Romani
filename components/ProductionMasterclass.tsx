
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SelectedGenre, DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';

interface MasterclassTopic {
  id: string;
  name: string;
  category: 'Mixing' | 'Production';
  icon: string;
  description: string;
}

const MASTERCLASS_TOPICS: MasterclassTopic[] = [
  // Mixing Essentials
  { id: 'balance', name: 'Balance (Levels)', category: 'Mixing', icon: '🎚️', description: 'Setting the volume of each track so everything is heard clearly.' },
  { id: 'eq', name: 'Equalization (EQ)', category: 'Mixing', icon: '📈', description: 'Adjusting frequency content to make instruments fit together.' },
  { id: 'dynamics', name: 'Dynamics (Compression)', category: 'Mixing', icon: '🗜️', description: 'Controlling loudness differences for punch and consistency.' },
  { id: 'stereo', name: 'Stereo Image (Panning)', category: 'Mixing', icon: '↔️', description: 'Creating width and separation in the left-to-right spectrum.' },
  { id: 'space', name: 'Space (Effects)', category: 'Mixing', icon: '🌊', description: 'Using reverb and delay to create depth and atmosphere.' },
  { id: 'automation', name: 'Automation', category: 'Mixing', icon: '✍️', description: 'Making changes over time to keep the song dynamic.' },
  // Production Foundations
  { id: 'arrangement', name: 'Arrangement', category: 'Production', icon: '🏗️', description: 'Deciding which instruments play when and how they interact.' },
  { id: 'melody', name: 'Melody & Harmony', category: 'Production', icon: '🎼', description: 'The main tune and supporting chords/harmonies.' },
  { id: 'rhythm', name: 'Rhythm & Tempo', category: 'Production', icon: '🥁', description: 'The beat, groove, and speed of the track.' },
  { id: 'timbre', name: 'Timbre (Tone Color)', category: 'Production', icon: '🎨', description: 'The unique sonic quality and texture of each sound.' },
];

interface ProductionMasterclassProps {
  activeDAW: DAWType;
  selectedGenre: SelectedGenre | null;
}

const ProductionMasterclass: React.FC<ProductionMasterclassProps> = ({ activeDAW, selectedGenre }) => {
  const [selectedTopic, setSelectedTopic] = useState<MasterclassTopic | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startTopic = async (topic: MasterclassTopic) => {
    if (!selectedGenre) return;
    setSelectedTopic(topic);
    setLoading(true);
    setContent(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const daw = DAW_PROFILES[activeDAW];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Provide a detailed "Production Masterclass" module on the topic "${topic.name}" for the genre "${selectedGenre.sub}" (${selectedGenre.cat}). 
        
        The tutorial MUST be tailored for users working in ${activeDAW}.
        
        FOCUS AREAS:
        - Specific ${activeDAW} terminology: ${daw.terminology.join(', ')}.
        - Stock plugins to use in ${activeDAW}: ${daw.stockPlugins.join(', ')}.
        - Workflow specific to ${activeDAW} (${daw.workflowFocus}).
        - Technical execution specific to this genre.
        - Industry standard starting points.
        - Common pitfalls in this style.
        - ${activeDAW} specific "Pro Tips" (shortcuts or hidden features).
        
        Use Markdown formatting with bold headers and bullet points.`,
        config: {
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });
      setContent(response.text || "Failed to generate masterclass content.");
    } catch (err) {
      console.error("Masterclass generation error:", err);
      setContent("An error occurred while loading the engineering knowledge base.");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedGenre) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
        <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
          <span className="text-4xl">🎓</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Select a Genre Profile</h3>
        <p className="text-zinc-500 max-w-md">
          Masterclass guidance is tailored to your genre and ${activeDAW}. Select a sub-genre in the **Assistant Chat** to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {!selectedTopic ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="space-y-4">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest pl-1">Core Mixing Essentials</h3>
            <div className="grid gap-3">
              {MASTERCLASS_TOPICS.filter(t => t.category === 'Mixing').map(topic => (
                <button
                  key={topic.id}
                  onClick={() => startTopic(topic)}
                  className="flex items-start gap-4 p-4 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 hover:border-blue-500/30 rounded-2xl transition-all text-left group"
                >
                  <span className="text-2xl bg-zinc-950 p-3 rounded-xl border border-zinc-800 group-hover:border-blue-500/50 transition-colors">{topic.icon}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">{topic.name}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{topic.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-purple-500 uppercase tracking-widest pl-1">Foundational Production</h3>
            <div className="grid gap-3">
              {MASTERCLASS_TOPICS.filter(t => t.category === 'Production').map(topic => (
                <button
                  key={topic.id}
                  onClick={() => startTopic(topic)}
                  className="flex items-start gap-4 p-4 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 hover:border-purple-500/30 rounded-2xl transition-all text-left group"
                >
                  <span className="text-2xl bg-zinc-950 p-3 rounded-xl border border-zinc-800 group-hover:border-purple-500/50 transition-colors">{topic.icon}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">{topic.name}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{topic.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="flex-1 bg-zinc-900/40 rounded-3xl border border-zinc-800 overflow-hidden flex flex-col backdrop-blur-md animate-in zoom-in-95 duration-300">
          <header className="p-6 bg-zinc-950/60 border-b border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedTopic(null)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </button>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-blue-500">{selectedTopic.icon}</span>
                  {selectedTopic.name} Masterclass
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Studio: {activeDAW} | Genre: {selectedGenre.sub}</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 border border-zinc-700">
              {activeDAW.toUpperCase()} MODULE
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Consulting {activeDAW} Knowledge Base...</p>
              </div>
            ) : content && (
              <div className="prose prose-invert prose-blue max-w-none prose-sm animate-in fade-in slide-in-from-top-2 duration-500">
                {content.split('\n').map((line, i) => {
                  if (line.startsWith('#')) {
                    return <h3 key={i} className="text-blue-400 font-bold mt-6 mb-3 uppercase tracking-tight text-base border-l-2 border-blue-500 pl-4">{line.replace(/#/g, '').trim()}</h3>;
                  }
                  if (line.startsWith('-') || line.startsWith('*')) {
                    return <li key={i} className="text-zinc-300 ml-4 mb-2 list-none flex gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{line.substring(1).trim()}</span>
                    </li>;
                  }
                  return <p key={i} className="text-zinc-400 leading-relaxed mb-4">{line}</p>;
                })}
                
                <div className="mt-12 p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl italic text-sm text-zinc-400">
                   "Mastering ${activeDAW} means understanding how its unique architecture serves the rhythm of ${selectedGenre.sub}."
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}} />
    </div>
  );
};

export default ProductionMasterclass;
