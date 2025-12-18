
import React from 'react';
import { DAWType } from '../types';
import { DAW_PROFILES } from '../data/daws';

interface StudioSetupProps {
  activeDAW: DAWType;
}

const StudioSetup: React.FC<StudioSetupProps> = ({ activeDAW }) => {
  const profile = DAW_PROFILES[activeDAW];

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 overflow-y-auto custom-scrollbar pr-2">
      {/* DAW Header Section */}
      <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <span className="text-9xl font-black">{profile.icon}</span>
        </div>
        
        <header className="relative z-10 max-w-2xl">
          <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Engineering Technical Manual</h3>
          <h2 className="text-4xl font-black text-white mb-4">{activeDAW} Environment</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {profile.workflowFocus} This profile is specifically calibrated for surgical engineering, high-fidelity tracking, and professional mastering within the {activeDAW} ecosystem.
          </p>
        </header>

        <div className="mt-8 flex flex-wrap gap-2 relative z-10">
           {profile.terminology.map(term => (
             <span key={term} className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
               {term}
             </span>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shortcuts & Settings Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recommended Audio Settings */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md">
            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Audio Engine Settings
            </h4>
            <div className="space-y-4">
               {profile.recommendedSettings.map((setting, i) => (
                 <div key={i} className="group">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-zinc-300">{setting.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{setting.value}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-snug group-hover:text-zinc-400 transition-colors">{setting.description}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Essential Shortcuts */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-md">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Essential Shortcuts
            </h4>
            <div className="space-y-3">
               {profile.shortcuts.map((shortcut, i) => (
                 <div key={i} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-xl hover:border-blue-500/30 transition-all group">
                   <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200">{shortcut.action}</span>
                   <kbd className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[9px] font-mono text-blue-400 font-bold shadow-sm">
                     {shortcut.key}
                   </kbd>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Detailed Philosophies Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mixing Philosophy */}
            <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md border-t-4 border-t-blue-500">
               <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Mixing Philosophy</h4>
               <p className="text-sm text-zinc-300 leading-relaxed italic">
                 "{profile.mixingPhilosophy}"
               </p>
            </div>

            {/* Mastering Logic */}
            <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md border-t-4 border-t-purple-500">
               <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4">Mastering Workflow</h4>
               <p className="text-sm text-zinc-300 leading-relaxed italic">
                 "{profile.masteringWorkflow}"
               </p>
            </div>
          </div>

          {/* Core Stock Tools Catalogue */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md">
            <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-8">Stock Processing Suite</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {profile.stockPlugins.map(plugin => (
                 <div key={plugin} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-orange-500/30 transition-all shadow-inner">
                    <div className="w-8 h-8 rounded-lg bg-orange-950/20 border border-orange-500/20 flex items-center justify-center text-lg mb-3 grayscale group-hover:grayscale-0 transition-all">
                      🛠️
                    </div>
                    <span className="text-xs font-bold text-zinc-300 group-hover:text-orange-400 transition-colors">{plugin}</span>
                 </div>
               ))}
            </div>
            <div className="mt-8 p-4 bg-orange-900/5 border border-orange-500/10 rounded-2xl">
               <p className="text-[11px] text-zinc-500 leading-relaxed italic text-center">
                 "Professional results in {activeDAW} start with mastering the nuances of these stock tools before reaching for external VSTs."
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioSetup;
