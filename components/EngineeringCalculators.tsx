
import React, { useState } from 'react';
import { calculateDelayTimes, freqToNote } from '../utils/audioUtils';

const EngineeringCalculators: React.FC = () => {
  const [bpm, setBpm] = useState<number>(128);
  const [freq, setFreq] = useState<number>(440);
  const times = calculateDelayTimes(bpm);

  return (
    <div className="space-y-6">
      {/* BPM Timing Calculator */}
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <span className="text-blue-500">⏱️</span> BPM Sync Engine
        </h2>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Project Tempo</label>
            <span className="text-2xl font-mono font-bold text-blue-400">{bpm} <span className="text-sm font-normal text-zinc-600">BPM</span></span>
          </div>
          <input 
            type="range" 
            min="40" 
            max="250" 
            value={bpm} 
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Quarter', val: times.quarter },
            { label: '8th', val: times.eighth },
            { label: 'Dotted 8th', val: times.dottedEighth },
            { label: '16th', val: times.sixteenth },
          ].map(item => (
            <div key={item.label} className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800 group hover:border-blue-500/30 transition-colors">
              <span className="text-[10px] text-zinc-500 block mb-1 uppercase tracking-tighter">{item.label}</span>
              <span className="text-lg font-mono text-zinc-200 group-hover:text-blue-400 transition-colors">{item.val.toFixed(2)}<span className="text-xs text-zinc-600 ml-1">ms</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Note-to-Freq Converter */}
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <span className="text-purple-500">🎹</span> Frequency Lab
        </h2>
        
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Frequency (Hz)</label>
              <span className="text-lg font-mono font-bold text-purple-400">{freqToNote(freq)}</span>
            </div>
            <div className="flex gap-4 items-center">
               <input 
                type="number" 
                value={freq} 
                onChange={(e) => setFreq(Math.max(20, parseInt(e.target.value) || 20))}
                className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-200 font-mono"
              />
              <input 
                type="range" 
                min="20" 
                max="5000" 
                value={freq} 
                onChange={(e) => setFreq(parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
          
          <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
            <p className="text-xs text-zinc-500 leading-relaxed italic">
              "Understanding your frequency-to-pitch relationships helps in tuning drum hits and creating precise EQ bell curves for tonal balancing."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineeringCalculators;
