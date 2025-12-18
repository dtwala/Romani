
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Preset } from '../types';
import { GENRE_DATABASE } from '../data/genres';
import ExportMenu from './ExportMenu';
import { exportToPDF, exportToDocx } from '../utils/exportUtils';

const INITIAL_PRESETS: Preset[] = [
  {
    id: '1',
    name: 'Modern Hip Hop Mix',
    genre: 'Boom bap',
    type: 'Mixing',
    params: {
      eq: 'Low Cut 30Hz, Boost 60Hz (+3dB), Dip 400Hz (-2dB), High Shelf 8kHz (+2dB)',
      compression: 'Vocal: 4:1 Ratio, Fast Attack, Med Release. Kick: 6:1 Ratio, Slow Attack.',
      reverb: 'Short Plate on Vocals (1.2s), Mono Delay for slapback.',
      special: 'Parallel saturation on the 808 sub-group.'
    },
    notes: 'Focus on the "knock" of the kick and clarity in the high-mids of the vocal.'
  },
  {
    id: 'deep-house-vibe',
    name: 'Deep House Master',
    genre: 'Deep House',
    type: 'Mastering',
    params: {
      eq: 'Gentle low-mid bump at 200Hz for warmth. High-shelf boost at 12kHz.',
      compression: 'Bus Comp: 1.5:1 Ratio, 30ms Attack, Auto Release.',
      reverb: 'Subtle 0.5s Room on high-hats/perc only.',
      special: 'Mid-Side EQ cutting sides below 120Hz.'
    },
    notes: 'Aim for a smooth, warm top end and a rock-solid mono low-end.'
  },
  {
    id: 'tech-house-punch',
    name: 'Tech House Mix',
    genre: 'Tech House',
    type: 'Mixing',
    params: {
      eq: 'Kick: Cut 400Hz. Bass: Boost 100Hz. Percs: High Pass 400Hz.',
      compression: 'Drum Bus: Parallel compression 40% mix. Bass: Sidechain to Kick.',
      reverb: 'Non-linear reverb on clap. Short delay on synth stabs.',
      special: 'Aggressive limiting on the drum transients.'
    },
    notes: 'Prioritize the rhythmic relationship between the kick and the sub.'
  }
];

const PresetsManager: React.FC = () => {
  const [presets, setPresets] = useState<Preset[]>(INITIAL_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [newPreset, setNewPreset] = useState<Partial<Preset>>({
    name: '', genre: 'Deep House', type: 'Mixing', params: { eq: '', compression: '', reverb: '', special: '' }, notes: ''
  });

  const handleExport = async (format: 'pdf' | 'docx' | 'png' | 'jpg') => {
    if (!selectedPreset) return;
    const title = `Preset: ${selectedPreset.name} (${selectedPreset.type})`;
    const sections = [
      { heading: 'Genre Context', content: selectedPreset.genre },
      { heading: 'Spectral Settings', content: selectedPreset.params.eq },
      { heading: 'Dynamics Architecture', content: selectedPreset.params.compression },
      { heading: 'Spatial Atmosphere', content: selectedPreset.params.reverb },
      { heading: 'Advanced Processing', content: selectedPreset.params.special },
      { heading: 'Engineering Philosophy', content: selectedPreset.notes }
    ];
    if (format === 'pdf') await exportToPDF(title, sections, `preset_${selectedPreset.id}`);
    else if (format === 'docx') await exportToDocx(title, sections, `preset_${selectedPreset.id}`);
    else alert("Snapshots coming soon.");
  };

  useEffect(() => {
    const saved = localStorage.getItem('sonic_presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const initialIds = new Set(INITIAL_PRESETS.map(p => p.id));
        const custom = parsed.filter((p: Preset) => !initialIds.has(p.id));
        setPresets([...INITIAL_PRESETS, ...custom]);
      } catch (e) {
        console.error("Failed to load presets", e);
      }
    }
  }, []);

  const saveToLocal = (updated: Preset[]) => {
    setPresets(updated);
    const initialIds = new Set(INITIAL_PRESETS.map(p => p.id));
    const custom = updated.filter(p => !initialIds.has(p.id));
    localStorage.setItem('sonic_presets', JSON.stringify(custom));
  };

  const handleSaveNew = () => {
    if (!newPreset.name) return;
    const preset: Preset = {
      ...newPreset as Preset,
      id: Date.now().toString(),
    };
    const updated = [...presets, preset];
    saveToLocal(updated);
    setIsAdding(false);
    setSelectedPreset(preset);
  };

  const deletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    saveToLocal(updated);
    if (selectedPreset?.id === id) setSelectedPreset(null);
  };

  const smartSuggest = async () => {
    if (!newPreset.genre || !newPreset.type) return;
    setIsSuggesting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a professional studio preset for the sub-genre "${newPreset.genre}" and production stage "${newPreset.type}".
        
        Provide high-end engineering settings for EQ, Compression, Reverb, and Special Processing.
        
        Return ONLY a JSON object:
        {
          "name": "A professional name for this preset",
          "params": {
            "eq": "Detailed EQ settings",
            "compression": "Detailed dynamics settings",
            "reverb": "Spatial/Atmospheric settings",
            "special": "Utility/Saturation/Advanced tips"
          },
          "notes": "A brief engineering philosophy for this sub-genre"
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text);
      setNewPreset(prev => ({
        ...prev,
        name: data.name,
        params: data.params,
        notes: data.notes
      }));
    } catch (err) {
      console.error("Smart Suggest error:", err);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="flex h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar List */}
      <div className="w-1/3 bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col backdrop-blur-md">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Preset Library</h3>
          <button 
            onClick={() => {
                setIsAdding(true);
                setNewPreset({ name: '', genre: 'Deep House', type: 'Mixing', params: { eq: '', compression: '', reverb: '', special: '' }, notes: '' });
            }}
            className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors shadow-lg shadow-blue-900/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedPreset(p); setIsAdding(false); }}
              className={`w-full text-left p-3 rounded-xl transition-all group relative border ${
                selectedPreset?.id === p.id 
                  ? 'bg-blue-600/20 border-blue-500/30 shadow-inner' 
                  : 'hover:bg-zinc-800/50 border-transparent'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-sm font-bold ${selectedPreset?.id === p.id ? 'text-blue-400' : 'text-zinc-200'}`}>{p.name}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-tighter bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">{p.genre}</span>
                    <span className="text-[9px] text-blue-500/80 uppercase font-black tracking-tighter">{p.type}</span>
                  </div>
                </div>
                {INITIAL_PRESETS.every(ip => ip.id !== p.id) && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deletePreset(p.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden backdrop-blur-md flex flex-col">
        {isAdding ? (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
            <header className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Create Studio Preset</h2>
                <button 
                  onClick={smartSuggest}
                  disabled={isSuggesting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
                >
                  {isSuggesting ? (
                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : '✨'}
                  Smart Suggest
                </button>
            </header>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1">Preset Name</label>
                <input 
                  type="text" 
                  value={newPreset.name} 
                  onChange={e => setNewPreset({...newPreset, name: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. Smooth Tech House Master"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1">Sub-Genre Variation</label>
                <select 
                   value={newPreset.genre} 
                   onChange={e => setNewPreset({...newPreset, genre: e.target.value})}
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {GENRE_DATABASE.map(cat => (
                    <optgroup key={cat.name} label={cat.name}>
                      {cat.subgenres.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1">Stage</label>
                 <div className="flex gap-2">
                    {['Mixing', 'Mastering'].map(t => (
                      <button
                        key={t}
                        onClick={() => setNewPreset({...newPreset, type: t as any})}
                        className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${
                          newPreset.type === t ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
               {[
                 { key: 'eq', label: 'Spectral (EQ)', icon: '📈' },
                 { key: 'compression', label: 'Dynamics', icon: '🗜️' },
                 { key: 'reverb', label: 'Spatial', icon: '🌊' },
                 { key: 'special', label: 'Advanced', icon: '⚡' }
               ].map(field => (
                 <div key={field.key} className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1 flex items-center gap-2">
                      <span className="text-xs">{field.icon}</span>
                      {field.label}
                    </label>
                    <textarea 
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-[11px] leading-relaxed font-mono"
                      placeholder={`Enter ${field.label.toLowerCase()} settings...`}
                      value={(newPreset.params as any)?.[field.key]}
                      onChange={e => setNewPreset({
                        ...newPreset, 
                        params: { ...newPreset.params as any, [field.key]: e.target.value }
                      })}
                    />
                 </div>
               ))}
            </div>

            <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1">Engineering Notes</label>
                <textarea 
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-[11px] leading-relaxed italic"
                  placeholder="Share the sonic philosophy behind this preset..."
                  value={newPreset.notes}
                  onChange={e => setNewPreset({...newPreset, notes: e.target.value})}
                />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleSaveNew}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
              >
                Commit to Library
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="px-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-black text-xs uppercase rounded-2xl transition-all"
              >
                Discard
              </button>
            </div>
          </div>
        ) : selectedPreset ? (
          <div className="flex flex-col h-full">
            <div className="p-8 bg-zinc-900/60 border-b border-zinc-800">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-3xl font-black text-white mb-2 uppercase tracking-tight">{selectedPreset.name}</div>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-[10px] rounded-full uppercase font-black border border-blue-500/20 tracking-widest">{selectedPreset.genre}</span>
                    <span className="px-3 py-1 bg-purple-900/30 text-purple-400 text-[10px] rounded-full uppercase font-black border border-purple-500/20 tracking-widest">{selectedPreset.type}</span>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                   <ExportMenu onExport={handleExport} />
                   <div className="text-right">
                     <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-1">Status</div>
                     <div className="px-3 py-1 bg-emerald-900/20 border border-emerald-500/20 rounded-lg text-emerald-400 flex items-center gap-1.5 text-[10px] font-black uppercase">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> Active Profile
                     </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-8 custom-scrollbar">
              {[
                { label: 'Spectral Logic', icon: '📈', val: selectedPreset.params.eq, color: 'text-emerald-400' },
                { label: 'Dynamics Arch', icon: '🗜️', val: selectedPreset.params.compression, color: 'text-blue-400' },
                { label: 'Spatial Field', icon: '🌊', val: selectedPreset.params.reverb, color: 'text-purple-400' },
                { label: 'Advanced Processing', icon: '⚡', val: selectedPreset.params.special, color: 'text-orange-400' },
              ].map(item => (
                <div key={item.label} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xl ${item.color.replace('text-', 'bg-').replace('400', '900/20')} p-2 rounded-lg`}>{item.icon}</span>
                    <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{item.label}</h4>
                  </div>
                  <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl text-[11px] text-zinc-300 leading-relaxed font-mono min-h-[100px] shadow-inner">
                    {item.val || "No parameters defined."}
                  </div>
                </div>
              ))}
              
              <div className="col-span-2 space-y-3">
                 <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Engineering Philosophy</h4>
                 <div className="p-6 bg-blue-900/5 border border-blue-500/10 rounded-2xl text-xs text-zinc-400 italic leading-relaxed">
                    "{selectedPreset.notes}"
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40 grayscale">
             <div className="w-24 h-24 bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 rotate-3 border border-zinc-700 shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
             </div>
             <h3 className="text-2xl font-black text-zinc-400 uppercase tracking-tighter">Preset Vault Offline</h3>
             <p className="text-zinc-600 max-w-[320px] mt-2 text-sm">Select a variation from your library to load industry-standard starting points or architect a custom sonic profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresetsManager;
