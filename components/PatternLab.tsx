
import React, { useState, useEffect } from 'react';
import { SelectedGenre } from '../types';
import ExportMenu from './ExportMenu';
import { exportToPDF, exportToDocx, exportToImage } from '../utils/exportUtils';

interface DrumStep {
  active: boolean;
}

interface PatternData {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  perc: boolean[];
  chords: string[];
}

const DEFAULT_PATTERN: PatternData = {
  kick: new Array(16).fill(false),
  snare: new Array(16).fill(false),
  hihat: new Array(16).fill(false),
  perc: new Array(16).fill(false),
  chords: ['I', 'IV', 'V', 'I']
};

const GENRE_PATTERNS: Record<string, PatternData> = {
  "Hip-hop": {
    kick: [true, false, false, false, false, false, true, false, false, true, false, false, false, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    perc: [false, false, false, true, false, false, false, false, false, false, true, false, false, false, false, false],
    chords: ['i', 'iv7', 'v7', 'i']
  },
  "Electronic": {
    kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
    perc: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true],
    chords: ['vi', 'IV', 'I', 'V']
  },
  "Rock": {
    kick: [true, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    perc: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    chords: ['I', 'V', 'vi', 'IV']
  },
  "Jazz": {
    kick: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    snare: [false, false, false, true, false, false, true, false, false, false, false, true, false, false, false, false],
    hihat: [false, false, true, true, false, false, true, true, false, false, true, true, false, false, true, true],
    perc: [false, true, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    chords: ['ii7', 'V7', 'Imaj7', 'vi7']
  },
  "Blues": {
    kick: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, true],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    perc: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    chords: ['I7', 'IV7', 'I7', 'V7']
  },
  "Reggae": {
    kick: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
    perc: [true, false, true, false, false, false, false, false, true, false, true, false, false, false, false, false],
    chords: ['I', 'ii', 'I', 'V']
  }
};

interface PatternLabProps {
  selectedGenre: SelectedGenre | null;
}

const PatternLab: React.FC<PatternLabProps> = ({ selectedGenre }) => {
  const [activePattern, setActivePattern] = useState<PatternData>(DEFAULT_PATTERN);

  useEffect(() => {
    if (selectedGenre) {
      const pattern = GENRE_PATTERNS[selectedGenre.cat] || DEFAULT_PATTERN;
      setActivePattern(pattern);
    }
  }, [selectedGenre]);

  const handleExport = async (format: 'pdf' | 'docx' | 'png' | 'jpg') => {
    const title = `Pattern Lab Profile: ${selectedGenre?.sub}`;
    const filename = `pattern_${selectedGenre?.sub.toLowerCase()}`;
    
    if (format === 'pdf' || format === 'docx') {
      const sections = [
        { heading: 'Chord Progression', content: activePattern.chords.join(' - ') },
        { heading: 'Rhythmic Configuration', content: `Kick: ${activePattern.kick.map(s => s ? '1' : '0').join('')}\nSnare: ${activePattern.snare.map(s => s ? '1' : '0').join('')}\nHi-hat: ${activePattern.hihat.map(s => s ? '1' : '0').join('')}` }
      ];
      if (format === 'pdf') await exportToPDF(title, sections, filename);
      else await exportToDocx(title, sections, filename);
    } else {
      await exportToImage('pattern-lab-visual-area', format, filename);
    }
  };

  const GridRow = ({ label, steps, color }: { label: string, steps: boolean[], color: string }) => (
    <div className="flex items-center gap-4 group">
      <div className="w-12 text-[10px] font-black text-zinc-500 uppercase tracking-tighter text-right group-hover:text-zinc-300 transition-colors">
        {label}
      </div>
      <div className="flex-1 grid grid-cols-16 gap-1">
        {steps.map((active, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-all border ${
              active 
                ? `${color} border-white/20 shadow-[0_0_8px_${color.replace('bg-', '')}]` 
                : 'bg-zinc-900 border-zinc-800'
            } ${i % 4 === 0 ? 'border-zinc-700' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  );

  if (!selectedGenre) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
        <div className="w-20 h-20 bg-emerald-600/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
          <span className="text-4xl">🧪</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Pattern Lab Offline</h3>
        <p className="text-zinc-500 max-w-md">
          Rhythm and chord structures are genre-specific. Select a sub-genre in the **Assistant Chat** to load the laboratory modules.
        </p>
      </div>
    );
  }

  return (
    <div id="pattern-lab-visual-area" className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-zinc-950/20 p-4 rounded-3xl">
      {/* Chord Progression Panel */}
      <section className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md relative">
        <div className="absolute top-8 right-8">
           <ExportMenu onExport={handleExport} />
        </div>
        <div className="flex justify-between items-center mb-8">
          <div className="pr-40">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Harmonic Architecture</h3>
            <p className="text-xl font-bold text-white">Suggested Progression: {selectedGenre.sub}</p>
          </div>
          <div className="px-3 py-1 bg-blue-900/20 border border-blue-500/30 rounded-full text-blue-400 text-[10px] font-black uppercase">
            Theoretical Analysis
          </div>
        </div>

        <div className="flex gap-4">
          {activePattern.chords.map((chord, i) => (
            <div 
              key={i} 
              className="flex-1 aspect-[4/3] bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center group hover:border-blue-500/40 transition-all shadow-inner"
            >
              <span className="text-3xl font-bold text-blue-400 mb-1 group-hover:scale-110 transition-transform">{chord}</span>
              <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Beat {i + 1}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-zinc-500 italic leading-relaxed">
          * This harmonic structure defines the foundational mood for {selectedGenre.sub}. Focus on {activePattern.chords[0]} as the home key to establish the tonal center.
        </p>
      </section>

      {/* Rhythmic Grid Panel */}
      <section className="flex-1 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8 backdrop-blur-md flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Rhythmic Matrix</h3>
            <p className="text-xl font-bold text-white">16-Step Sequencing Protocol</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Kick</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Snare</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Hi-Hat</span>
             </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-6">
          <GridRow label="Kick" steps={activePattern.kick} color="bg-blue-600" />
          <GridRow label="Snare" steps={activePattern.snare} color="bg-purple-600" />
          <GridRow label="Hi-Hat" steps={activePattern.hihat} color="bg-yellow-500" />
          <GridRow label="Perc" steps={activePattern.perc} color="bg-zinc-400" />
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-between items-end">
          <div className="max-w-md">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Engineering Insight</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              The groove of {selectedGenre.sub} relies heavily on the {activePattern.snare.filter(s => s).length > 2 ? 'syncopation' : 'backbeat'} of the snare. Ensure your transient shaping emphasizes steps {activePattern.snare.indexOf(true) + 1} and {activePattern.snare.lastIndexOf(true) + 1} for maximum impact.
            </p>
          </div>
          <div className="flex gap-1">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1 h-4 bg-zinc-800 rounded-full" style={{ height: `${4 + Math.random() * 8}px` }}></div>
            ))}
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .grid-cols-16 {
          grid-template-columns: repeat(16, minmax(0, 1fr));
        }
      `}} />
    </div>
  );
};

export default PatternLab;
