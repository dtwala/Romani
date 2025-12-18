
import React, { useEffect, useRef, useState } from 'react';
import { SelectedGenre, DAWType } from '../types';
import { GoogleGenAI } from '@google/genai';
import ExportMenu from './ExportMenu';
import { exportToPDF, exportToDocx, exportToImage } from '../utils/exportUtils';

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

interface ComparisonResult {
  tonalBalance: string;
  dynamicsCompare: string;
  stereoDepth: string;
  correctionBlueprint: string[];
}

const AudioAnalyzer: React.FC<{ selectedGenre: SelectedGenre | null; instrumentName: string | null }> = ({ selectedGenre, instrumentName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [activeProfile, setActiveProfile] = useState<InstrumentProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [mode, setMode] = useState<'realtime' | 'reference'>('realtime');
  
  // Reference Mode States
  const [mixFile, setMixFile] = useState<File | null>(null);
  const [refFile, setRefFile] = useState<File | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Fix: Ensure format is narrowed down to 'png' | 'jpg' when calling exportToImage
  const handleExport = async (format: 'pdf' | 'docx' | 'png' | 'jpg') => {
    if (mode === 'reference' && comparison) {
      const sections = [
        { heading: 'Tonal Balance Analysis', content: comparison.tonalBalance },
        { heading: 'Dynamic Range Comparison', content: comparison.dynamicsCompare },
        { heading: 'Stereo Depth Observation', content: comparison.stereoDepth },
        { heading: 'Correction Blueprint', content: comparison.correctionBlueprint.join('\n- ') }
      ];
      if (format === 'pdf') {
        await exportToPDF("Sonic Reference Analysis", sections, "reference_report");
        return;
      } else if (format === 'docx') {
        await exportToDocx("Sonic Reference Analysis", sections, "reference_report");
        return;
      }
    }
    
    // Narrow type for exportToImage which only supports 'png' | 'jpg'
    if (format === 'png' || format === 'jpg') {
      await exportToImage('analyzer-main-container', format, 'spectral_snapshot');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
      reader.onerror = error => reject(error);
    });
  };

  const performComparison = async () => {
    if (!mixFile || !refFile) return;
    setIsAnalyzing(true);
    setComparison(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const mixData = await fileToBase64(mixFile);
      const refData = await fileToBase64(refFile);

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: "Act as a senior mastering engineer. Compare the following two audio files. The first is my 'Current Mix' and the second is the 'Pro Reference Track'. Analyze the differences in frequency balance, dynamic range, and stereo width. Then suggest specific EQ and compression tweaks to make my mix sound as professional as the reference." },
              { inlineData: { data: mixData, mimeType: mixFile.type } },
              { inlineData: { data: refData, mimeType: refFile.type } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              tonalBalance: { type: "string" },
              dynamicsCompare: { type: "string" },
              stereoDepth: { type: "string" },
              correctionBlueprint: { type: "array", items: { type: "string" } }
            }
          }
        }
      });

      setComparison(JSON.parse(response.text));
    } catch (err) {
      console.error("Comparison Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
      analyzerRef.current = audioCtxRef.current.createAnalyser();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);
      setIsActive(true);
      draw();
    } catch (err) {
      console.error("Mic Error", err);
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyzerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const renderFrame = () => {
      if (!analyzerRef.current) return;
      animationRef.current = requestAnimationFrame(renderFrame);
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzerRef.current.getByteFrequencyData(dataArray);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgba(59, 130, 246, ${Math.max(0.2, dataArray[i]/255)})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    renderFrame();
  };

  return (
    <div id="analyzer-main-container" className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm h-full flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <div className="flex gap-4 p-1 bg-zinc-950 border border-zinc-800 rounded-xl w-fit">
          <button 
            onClick={() => setMode('realtime')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'realtime' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Live Spectrum
          </button>
          <button 
            onClick={() => setMode('reference')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'reference' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Reference Lab
          </button>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu onExport={handleExport} />
        </div>
      </header>

      {mode === 'realtime' ? (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-glow"></span>
              Spectral DNA
            </h2>
            <button 
              onClick={isActive ? () => setIsActive(false) : startAnalysis}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-600 text-white'}`}
            >
              {isActive ? "Pause Feed" : "Start Pulse"}
            </button>
          </div>
          <div className="flex-1 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden relative">
            <canvas ref={canvasRef} width={800} height={350} className="w-full h-full" />
            {!isActive && <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-zinc-600 text-xs uppercase font-black tracking-widest">Feed Standby</div>}
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
              <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest">Source Calibration</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">Your Current Mix</label>
                  <input type="file" accept="audio/*" onChange={(e) => setMixFile(e.target.files?.[0] || null)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">Professional Reference</label>
                  <input type="file" accept="audio/*" onChange={(e) => setRefFile(e.target.files?.[0] || null)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-purple-600 file:text-white" />
                </div>
              </div>
              <button 
                onClick={performComparison}
                disabled={!mixFile || !refFile || isAnalyzing}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-900/20"
              >
                {isAnalyzing ? "Processing Waveforms..." : "Analyze Differences"}
              </button>
            </div>
            
            {comparison && (
              <div className="bg-zinc-950/30 border border-zinc-800 rounded-3xl p-6 space-y-4">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Correction Blueprint</h4>
                <div className="space-y-2">
                  {comparison.correctionBlueprint.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                      <span className="text-blue-500 font-bold text-xs">{i+1}.</span>
                      <p className="text-xs text-zinc-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {isAnalyzing ? (
               <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center opacity-50">
                  <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Spectral AI Comparison in progress...</p>
               </div>
            ) : comparison ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div>
                  <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Tonal Balance</h5>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">"{comparison.tonalBalance}"</p>
                </div>
                <div>
                  <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Dynamic Range</h5>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">"{comparison.dynamicsCompare}"</p>
                </div>
                <div>
                  <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Stereo Field</h5>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">"{comparison.stereoDepth}"</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center">
                 <div className="text-5xl mb-4">🔬</div>
                 <p className="text-xs font-bold uppercase tracking-widest max-w-[200px]">Upload Tracks to Decode Pro Mastering Secrets</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioAnalyzer;
