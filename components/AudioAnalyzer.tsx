
import React, { useEffect, useRef, useState } from 'react';
import { SelectedGenre } from '../types';

interface FrequencyBand {
  label: string;
  min: number;
  max: number;
  color: string;
  type: 'sweet' | 'problem';
}

interface InstrumentProfile {
  name: string;
  icon: string;
  attack: string;
  sustain: string;
  genreUseCases: string[];
  bands: FrequencyBand[];
}

interface GenreAnalysisConfig {
  fftSize: number;
  smoothing: number;
  primaryColor: string;
  focusRange: [number, number];
  focusLabel: string;
}

const GENRE_ANALYSIS_MAP: Record<string, GenreAnalysisConfig> = {
  "Hip-hop": { fftSize: 1024, smoothing: 0.85, primaryColor: '#3b82f6', focusRange: [30, 100], focusLabel: 'SUB ENGINE' },
  "Electronic": { fftSize: 512, smoothing: 0.8, primaryColor: '#06b6d4', focusRange: [100, 300], focusLabel: 'TRANS PUNCH' },
  "Rock": { fftSize: 512, smoothing: 0.8, primaryColor: '#f97316', focusRange: [2000, 5000], focusLabel: 'GUITAR EDGE' },
  "Jazz": { fftSize: 2048, smoothing: 0.92, primaryColor: '#eab308', focusRange: [8000, 16000], focusLabel: 'SPECTRAL AIR' },
  "Pop": { fftSize: 512, smoothing: 0.88, primaryColor: '#ec4899', focusRange: [3000, 7000], focusLabel: 'VOCAL FOCUS' },
  "African": { fftSize: 1024, smoothing: 0.85, primaryColor: '#10b981', focusRange: [400, 1200], focusLabel: 'PERC RESONANCE' },
  "Reggae": { fftSize: 1024, smoothing: 0.9, primaryColor: '#facc15', focusRange: [40, 120], focusLabel: 'BASS FOUNDATION' },
  "Metal": { fftSize: 512, smoothing: 0.75, primaryColor: '#ef4444', focusRange: [3000, 6000], focusLabel: 'MID CUT' }
};

const INSTRUMENT_PROFILES: InstrumentProfile[] = [
  {
    name: 'Vocals',
    icon: '🎤',
    attack: 'Soft / Mid',
    sustain: 'High',
    genreUseCases: ['Pop', 'Jazz', 'Rock', 'R&B'],
    bands: [
      { label: 'Fundamental', min: 80, max: 200, color: 'rgba(59, 130, 246, 0.2)', type: 'sweet' },
      { label: 'Mud', min: 250, max: 500, color: 'rgba(239, 68, 68, 0.15)', type: 'problem' },
      { label: 'Presence', min: 3000, max: 5000, color: 'rgba(16, 185, 129, 0.2)', type: 'sweet' },
      { label: 'Air', min: 10000, max: 16000, color: 'rgba(139, 92, 246, 0.2)', type: 'sweet' },
    ]
  },
  {
    name: 'Kick Drum',
    icon: '🥁',
    attack: 'Very Fast / Punchy',
    sustain: 'Low',
    genreUseCases: ['Electronic', 'Hip-Hop', 'Metal'],
    bands: [
      { label: 'Sub/Weight', min: 50, max: 100, color: 'rgba(59, 130, 246, 0.2)', type: 'sweet' },
      { label: 'Boxy', min: 300, max: 600, color: 'rgba(239, 68, 68, 0.15)', type: 'problem' },
      { label: 'Beater Click', min: 2000, max: 4000, color: 'rgba(16, 185, 129, 0.2)', type: 'sweet' },
    ]
  },
  {
    name: 'Electric Bass',
    icon: '🎸',
    attack: 'Medium / Percussive',
    sustain: 'Medium-High',
    genreUseCases: ['Funk', 'Rock', 'Blues'],
    bands: [
      { label: 'Bottom', min: 40, max: 100, color: 'rgba(59, 130, 246, 0.2)', type: 'sweet' },
      { label: 'Attack', min: 700, max: 1200, color: 'rgba(16, 185, 129, 0.2)', type: 'sweet' },
      { label: 'Finger Noise', min: 2000, max: 5000, color: 'rgba(139, 92, 246, 0.2)', type: 'sweet' },
    ]
  },
  {
    name: 'Snare',
    icon: '🥁',
    attack: 'Fast / Sharp',
    sustain: 'Medium-Low',
    genreUseCases: ['Rock', 'Pop', 'Country'],
    bands: [
      { label: 'Body', min: 150, max: 250, color: 'rgba(59, 130, 246, 0.2)', type: 'sweet' },
      { label: 'Ring', min: 600, max: 900, color: 'rgba(239, 68, 68, 0.15)', type: 'problem' },
      { label: 'Snap/Crack', min: 2000, max: 5000, color: 'rgba(16, 185, 129, 0.2)', type: 'sweet' },
    ]
  },
  {
    name: 'Guitars',
    icon: '🎸',
    attack: 'Medium',
    sustain: 'Variable',
    genreUseCases: ['Rock', 'Indie', 'Folk'],
    bands: [
      { label: 'Body', min: 200, max: 400, color: 'rgba(59, 130, 246, 0.2)', type: 'sweet' },
      { label: 'Honk', min: 800, max: 1200, color: 'rgba(239, 68, 68, 0.15)', type: 'problem' },
      { label: 'Presence', min: 3000, max: 6000, color: 'rgba(16, 185, 129, 0.2)', type: 'sweet' },
    ]
  },
  {
    name: 'Synth Lead',
    icon: '🎹',
    attack: 'Fast / Modulated',
    sustain: 'Variable / High',
    genreUseCases: ['EDM', 'Synthwave', 'Hip-Hop'],
    bands: [
      { label: 'Bite', min: 2000, max: 4000, color: 'rgba(59, 130, 246, 0.2)', type: 'sweet' },
      { label: 'Harshness', min: 5000, max: 8000, color: 'rgba(239, 68, 68, 0.15)', type: 'problem' },
      { label: 'Fundamental', min: 200, max: 800, color: 'rgba(16, 185, 129, 0.2)', type: 'sweet' },
    ]
  },
  {
    name: 'Acoustic Piano',
    icon: '🎹',
    attack: 'Fast',
    sustain: 'High',
    genreUseCases: ['Classical', 'Jazz', 'Pop'],
    bands: [
      { label: 'Body', min: 150, max: 400, color: 'rgba(59, 130, 246, 0.2)', type: 'sweet' },
      { label: 'Clutter', min: 300, max: 600, color: 'rgba(239, 68, 68, 0.15)', type: 'problem' },
      { label: 'Clarity', min: 2000, max: 5000, color: 'rgba(16, 185, 129, 0.2)', type: 'sweet' },
    ]
  },
  {
    name: 'Drum Overheads',
    icon: '✨',
    attack: 'Fast',
    sustain: 'Medium',
    genreUseCases: ['Rock', 'Jazz', 'Metal'],
    bands: [
      { label: 'Sizzle', min: 6000, max: 12000, color: 'rgba(59, 130, 246, 0.2)', type: 'sweet' },
      { label: 'Harshness', min: 3000, max: 5000, color: 'rgba(239, 68, 68, 0.15)', type: 'problem' },
      { label: 'Snare Body', min: 200, max: 500, color: 'rgba(16, 185, 129, 0.2)', type: 'sweet' },
    ]
  },
  {
    name: 'Cello',
    icon: '🎻',
    attack: 'Slow / Mid',
    sustain: 'Very High',
    genreUseCases: ['Classical', 'Cinematic', 'Folk'],
    bands: [
      { label: 'Warmth', min: 100, max: 300, color: 'rgba(59, 130, 246, 0.2)', type: 'sweet' },
      { label: 'Boxy', min: 400, max: 800, color: 'rgba(239, 68, 68, 0.15)', type: 'problem' },
      { label: 'Bow Noise', min: 2000, max: 4000, color: 'rgba(16, 185, 129, 0.2)', type: 'sweet' },
    ]
  },
  {
    name: 'Trumpet',
    icon: '🎺',
    attack: 'Fast / Mid',
    sustain: 'High',
    genreUseCases: ['Jazz', 'Latin', 'Orchestral'],
    bands: [
      { label: 'Body', min: 400, max: 1000, color: 'rgba(59, 130, 246, 0.2)', type: 'sweet' },
      { label: 'Piercing', min: 1500, max: 3000, color: 'rgba(239, 68, 68, 0.15)', type: 'problem' },
      { label: 'Brilliance', min: 4000, max: 8000, color: 'rgba(16, 185, 129, 0.2)', type: 'sweet' },
    ]
  }
];

interface AudioAnalyzerProps {
  selectedGenre: SelectedGenre | null;
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ selectedGenre }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<InstrumentProfile | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Dynamic analysis config based on genre
  const genreConfig = (selectedGenre && GENRE_ANALYSIS_MAP[selectedGenre.cat]) || {
    fftSize: 512,
    smoothing: 0.8,
    primaryColor: '#3b82f6',
    focusRange: [200, 2000],
    focusLabel: 'NEUTRAL PROFILE'
  };

  useEffect(() => {
    if (analyzerRef.current) {
      analyzerRef.current.fftSize = genreConfig.fftSize;
      analyzerRef.current.smoothingTimeConstant = genreConfig.smoothing;
    }
  }, [genreConfig]);

  const startAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
      analyzerRef.current = audioCtxRef.current.createAnalyser();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);
      
      analyzerRef.current.fftSize = genreConfig.fftSize;
      analyzerRef.current.smoothingTimeConstant = genreConfig.smoothing;
      
      setIsActive(true);
      draw();
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyzerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nyquist = 44100 / 2;

    const freqToX = (freq: number) => {
      const logMin = Math.log10(20);
      const logMax = Math.log10(20000);
      const logFreq = Math.log10(Math.max(20, freq));
      return ((logFreq - logMin) / (logMax - logMin)) * canvas.width;
    };

    const renderFrame = () => {
      if (!analyzerRef.current) return;
      animationRef.current = requestAnimationFrame(renderFrame);
      
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzerRef.current.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Genre Focus Overlay
      if (selectedGenre) {
        const [min, max] = genreConfig.focusRange;
        const xStart = freqToX(min);
        const xEnd = freqToX(max);
        const width = xEnd - xStart;

        ctx.fillStyle = `${genreConfig.primaryColor}05`; // Very subtle background
        ctx.fillRect(xStart, 0, width, canvas.height);
        
        ctx.strokeStyle = `${genreConfig.primaryColor}20`;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(xStart, 0, width, canvas.height);
        ctx.setLineDash([]);

        ctx.fillStyle = genreConfig.primaryColor;
        ctx.font = 'black 8px Inter';
        ctx.fillText(`GENRE FOCUS: ${genreConfig.focusLabel}`, xStart + 4, canvas.height - 25);
      }

      // 2. Draw Instrument Profile Bands
      if (selectedProfile) {
        selectedProfile.bands.forEach(band => {
          const xStart = freqToX(band.min);
          const xEnd = freqToX(band.max);
          const width = xEnd - xStart;

          ctx.fillStyle = band.color;
          ctx.fillRect(xStart, 0, width, canvas.height);

          ctx.fillStyle = band.type === 'problem' ? '#ef4444' : '#60a5fa';
          ctx.font = 'bold 9px Inter';
          ctx.fillText(band.label.toUpperCase(), xStart + 2, 12);
          
          ctx.strokeStyle = band.color.replace('0.2', '0.4').replace('0.15', '0.3');
          ctx.lineWidth = 1;
          ctx.strokeRect(xStart, 0, width, canvas.height);
        });
      }

      // 3. Draw Spectral Bars
      const barWidth = 2;
      for (let i = 0; i < bufferLength; i++) {
        const freq = (i * nyquist) / bufferLength;
        const x = freqToX(freq);
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient based on genre color
        const baseColor = genreConfig.primaryColor;
        ctx.fillStyle = `${baseColor}${Math.floor(Math.max(0.2, barHeight / canvas.height) * 255).toString(16).padStart(2, '0')}`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      }

      // 4. Draw Frequency Labels
      [100, 1000, 10000].forEach(f => {
        const x = freqToX(f);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '8px Monospace';
        ctx.fillText(f >= 1000 ? `${f/1000}k` : f.toString(), x + 2, canvas.height - 5);
      });
    };
    renderFrame();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
              style={{ backgroundColor: genreConfig.primaryColor }}
            ></span>
            Spectral Lab
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Resolution: <span className="text-zinc-300 font-mono">{genreConfig.fftSize} BIN</span>
            </p>
            <span className="text-zinc-800">|</span>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Mode: <span className="text-zinc-300 font-bold" style={{ color: genreConfig.primaryColor }}>{selectedGenre?.sub || 'LINEAR'}</span>
            </p>
          </div>
        </div>
        {!isActive ? (
          <button 
            onClick={startAnalysis}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors shadow-lg shadow-blue-900/20 font-bold uppercase tracking-widest"
          >
            Activate Matrix
          </button>
        ) : (
          <div className="flex gap-1 overflow-x-auto max-w-[300px] scrollbar-hide pb-1">
            {INSTRUMENT_PROFILES.map(p => (
              <button
                key={p.name}
                onClick={() => setSelectedProfile(selectedProfile?.name === p.name ? null : p)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-1 flex-shrink-0 border ${
                  selectedProfile?.name === p.name 
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/20' 
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-300'
                }`}
              >
                <span>{p.icon}</span> {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex-1 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-inner">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={300} 
          className="w-full h-full object-cover"
        />
        
        {selectedProfile && (
          <div className="absolute top-4 right-4 bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl backdrop-blur-md max-w-[240px] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <h4 className="text-[10px] text-blue-400 font-black uppercase mb-3 border-b border-zinc-800 pb-1 flex justify-between items-center">
              Sonic Intelligence
              <span className="text-zinc-600">v1.2</span>
            </h4>
            
            <div className="space-y-4">
              <div>
                <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">Dynamic Profile</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-950/50 p-1.5 rounded border border-zinc-800">
                    <p className="text-[7px] text-zinc-600 uppercase">Attack</p>
                    <p className="text-[9px] text-zinc-300 font-bold">{selectedProfile.attack}</p>
                  </div>
                  <div className="bg-zinc-950/50 p-1.5 rounded border border-zinc-800">
                    <p className="text-[7px] text-zinc-600 uppercase">Sustain</p>
                    <p className="text-[9px] text-zinc-300 font-bold">{selectedProfile.sustain}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">Spectral Bands</p>
                <div className="space-y-1.5">
                  {selectedProfile.bands.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.color.replace('0.2', '1').replace('0.15', '1') }}></div>
                      <div className="text-[9px] text-zinc-300">
                        <span className="font-bold text-zinc-400">{b.label}:</span> {b.min}-{b.max >= 1000 ? `${b.max/1000}k` : b.max}Hz
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">Genre Utility</p>
                <div className="flex flex-wrap gap-1">
                  {selectedProfile.genreUseCases.map(g => (
                    <span key={g} className="px-1.5 py-0.5 bg-zinc-800/50 border border-zinc-700 rounded text-[7px] text-zinc-400 uppercase font-bold">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Indicator Overlay */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded border border-white/5 backdrop-blur-sm">
           <div className="w-1 h-1 rounded-full bg-blue-500 animate-ping"></div>
           <span className="text-[7px] text-zinc-500 font-black uppercase tracking-widest">Real-time Stream Analysis Active</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-[10px] text-zinc-600 font-mono font-bold tracking-tighter">
        <span>20Hz (SUB)</span>
        <span>200Hz (BASS)</span>
        <span>2kHz (MID)</span>
        <span>20kHz (AIR)</span>
      </div>
    </div>
  );
};

export default AudioAnalyzer;
