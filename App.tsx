
import React, { useState } from 'react';
import LiveAssistant from './components/LiveAssistant';
import EngineeringCalculators from './components/EngineeringCalculators';
import AudioAnalyzer from './components/AudioAnalyzer';
import AssistantChat from './components/AssistantChat';
import PresetsManager from './components/PresetsManager';
import ProductionMasterclass from './components/ProductionMasterclass';
import PatternLab from './components/PatternLab';
import SignalFlowArchitect from './components/SignalFlowArchitect';
import DynamicsConsultant from './components/DynamicsConsultant';
import HarmonicConsultant from './components/HarmonicConsultant';
import SpatialConsultant from './components/SpatialConsultant';
import InstrumentDatabase from './components/InstrumentDatabase';
import VocalBooth from './components/VocalBooth';
import PluginAdvisor from './components/PluginAdvisor';
import StudioSetup from './components/StudioSetup';
import { ToolType, SelectedGenre, DAWType } from './types';
import { INSTRUMENT_CATEGORIES } from './data/instruments';
import { DAW_PROFILES } from './data/daws';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolType>(ToolType.LIVE_ASSISTANT);
  const [selectedGenre, setSelectedGenre] = useState<SelectedGenre | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [activeDAW, setActiveDAW] = useState<DAWType>(DAWType.ABLETON_LIVE);

  const NavItem = ({ type, icon, label }: { type: ToolType, icon: string, label: string }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === type 
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  const handleInstrumentSelect = (instrument: string) => {
    setSelectedInstrument(instrument);
    setActiveTab(ToolType.INSTRUMENT_DATABASE);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-zinc-300 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-zinc-800 p-6 flex flex-col gap-6 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M6 12l6-9 6 9"/><path d="M6 12l6 9 6-9"/></svg>
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white uppercase">Sonic AI</h1>
        </div>

        {/* Studio Environment Selector */}
        <div className="px-2">
          <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2 block">Studio Environment</label>
          <div className="relative group">
            <select 
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-10 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
              onChange={(e) => setActiveDAW(e.target.value as DAWType)}
              value={activeDAW}
            >
              {Object.values(DAWType).map(daw => (
                <option key={daw} value={daw}>{daw}</option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
              {DAW_PROFILES[activeDAW].icon}
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#52525B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <div className="mt-1.5 px-1 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
             <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tight">AI Engine Calibrated for {activeDAW}</span>
          </div>
        </div>

        {/* Global Instrument Database Dropdown */}
        <div className="px-2">
          <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2 block">Global Instrument Lab</label>
          <select 
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
            onChange={(e) => handleInstrumentSelect(e.target.value)}
            value={selectedInstrument || ""}
          >
            <option value="" disabled>Search Instruments...</option>
            {INSTRUMENT_CATEGORIES.map(cat => (
              <optgroup key={cat.name} label={cat.name}>
                {cat.items.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1 flex-1">
          <NavItem type={ToolType.LIVE_ASSISTANT} icon="🎙️" label="Live Studio" />
          <NavItem type={ToolType.ENGINEERING_CHAT} icon="🧠" label="Assistant Chat" />
          <NavItem type={ToolType.STUDIO_SETUP} icon="📐" label="Technical Manual" />
          <NavItem type={ToolType.VOCAL_BOOTH} icon="🎤" label="Vocal Booth" />
          <NavItem type={ToolType.PLUGIN_ADVISOR} icon="🔌" label="Plugin Advisor" />
          <NavItem type={ToolType.INSTRUMENT_DATABASE} icon="🗂️" label="Instrument Specs" />
          <div className="my-2 border-t border-zinc-800/50"></div>
          <NavItem type={ToolType.SPATIAL_CONSULTANT} icon="🌊" label="Spatial Lab" />
          <NavItem type={ToolType.HARMONIC_CONSULTANT} icon="🔥" label="Harmonic Lab" />
          <NavItem type={ToolType.DYNAMICS_CONSULTANT} icon="🗜️" label="Dynamics Lab" />
          <NavItem type={ToolType.SIGNAL_FLOW} icon="📉" label="Signal Flow" />
          <NavItem type={ToolType.MASTERCLASS} icon="🎓" label="Masterclass" />
          <NavItem type={ToolType.PATTERN_LAB} icon="🧪" label="Pattern Lab" />
          <NavItem type={ToolType.PRESETS} icon="📂" label="Preset Library" />
          <NavItem type={ToolType.CALCULATOR} icon="🎛️" label="Engineering Tools" />
          <NavItem type={ToolType.ANALYZER} icon="📊" label="Spectrum Lab" />
        </nav>

        <div className="mt-auto p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-xs text-zinc-400">All Engines Nominal</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 studio-gradient relative">
        <div className="max-w-5xl mx-auto h-full">
          <header className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {activeTab === ToolType.LIVE_ASSISTANT && "Voice Studio Control"}
                {activeTab === ToolType.ENGINEERING_CHAT && "Production Assistant"}
                {activeTab === ToolType.CALCULATOR && "Precision Engineering"}
                {activeTab === ToolType.ANALYZER && "Spectral Analysis"}
                {activeTab === ToolType.PRESETS && "Preset Library"}
                {activeTab === ToolType.MASTERCLASS && "Production Masterclass"}
                {activeTab === ToolType.PATTERN_LAB && "Pattern & Progression Lab"}
                {activeTab === ToolType.SIGNAL_FLOW && "Signal Flow Architect"}
                {activeTab === ToolType.DYNAMICS_CONSULTANT && "Dynamics Consultant"}
                {activeTab === ToolType.HARMONIC_CONSULTANT && "Harmonic Enhancement Lab"}
                {activeTab === ToolType.SPATIAL_CONSULTANT && "Spatial Dimension Lab"}
                {activeTab === ToolType.INSTRUMENT_DATABASE && "Instrument Specification Lab"}
                {activeTab === ToolType.VOCAL_BOOTH && "Vocal Booth Control"}
                {activeTab === ToolType.PLUGIN_ADVISOR && "Studio Plugin Advisor"}
                {activeTab === ToolType.STUDIO_SETUP && "Technical Environment Manual"}
              </h2>
              <p className="text-zinc-500 text-sm">
                {activeTab === ToolType.LIVE_ASSISTANT && "Hands-free real-time technical guidance."}
                {activeTab === ToolType.ENGINEERING_CHAT && "In-depth mixing, mastering, and sound design lessons."}
                {activeTab === ToolType.CALCULATOR && "Calculate precise delay, reverb, and frequency parameters."}
                {activeTab === ToolType.ANALYZER && "Monitor your signal path in high resolution."}
                {activeTab === ToolType.PRESETS && "Store and recall genre-specific starting points for EQ and dynamics."}
                {activeTab === ToolType.MASTERCLASS && "Deep-dive tutorials tailored to your specific genre and sub-genre."}
                {activeTab === ToolType.PATTERN_LAB && "Analyze and experiment with genre-defining rhythms and chord structures."}
                {activeTab === ToolType.SIGNAL_FLOW && "Logical processing chains for instruments and master buses."}
                {activeTab === ToolType.DYNAMICS_CONSULTANT && "Expert surgical compression and transient shaping guidance."}
                {activeTab === ToolType.HARMONIC_CONSULTANT && "Specialized saturation, grit, and analog warmth guidance."}
                {activeTab === ToolType.SPATIAL_CONSULTANT && "Advanced reverb, delay, and stereo field architecture."}
                {activeTab === ToolType.INSTRUMENT_DATABASE && `Surgical technical analysis for ${selectedInstrument || 'any studio source'}.`}
                {activeTab === ToolType.VOCAL_BOOTH && "End-to-end guidance from tracking to final mix."}
                {activeTab === ToolType.PLUGIN_ADVISOR && "Identify industry-standard VSTs for any instrument or sonic goal."}
                {activeTab === ToolType.STUDIO_SETUP && `Deep-dive technical specifications and settings for ${activeDAW}.`}
              </p>
            </div>
            <div className="flex gap-4 items-end">
              {selectedGenre && (
                <div className="flex flex-col items-end">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Active Profile</div>
                    <div className="px-3 py-1 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold">
                      {selectedGenre.sub}
                    </div>
                </div>
              )}
              <div className="flex flex-col items-end">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Active DAW</div>
                  <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-300 text-xs font-bold flex items-center gap-1.5">
                    <span>{DAW_PROFILES[activeDAW].icon}</span>
                    <span>{activeDAW}</span>
                  </div>
              </div>
            </div>
          </header>

          <div className="grid gap-6 h-[calc(100%-120px)]">
            {activeTab === ToolType.LIVE_ASSISTANT && <LiveAssistant activeDAW={activeDAW} />}
            {activeTab === ToolType.ENGINEERING_CHAT && <AssistantChat activeDAW={activeDAW} selectedGenre={selectedGenre} setSelectedGenre={setSelectedGenre} />}
            {activeTab === ToolType.STUDIO_SETUP && <StudioSetup activeDAW={activeDAW} />}
            {activeTab === ToolType.PRESETS && <PresetsManager />}
            {activeTab === ToolType.MASTERCLASS && <ProductionMasterclass activeDAW={activeDAW} selectedGenre={selectedGenre} />}
            {activeTab === ToolType.PATTERN_LAB && <PatternLab selectedGenre={selectedGenre} />}
            {activeTab === ToolType.SIGNAL_FLOW && <SignalFlowArchitect activeDAW={activeDAW} selectedGenre={selectedGenre} />}
            {activeTab === ToolType.DYNAMICS_CONSULTANT && <DynamicsConsultant activeDAW={activeDAW} selectedGenre={selectedGenre} />}
            {activeTab === ToolType.HARMONIC_CONSULTANT && <HarmonicConsultant activeDAW={activeDAW} selectedGenre={selectedGenre} />}
            {activeTab === ToolType.SPATIAL_CONSULTANT && <SpatialConsultant activeDAW={activeDAW} selectedGenre={selectedGenre} />}
            {activeTab === ToolType.INSTRUMENT_DATABASE && <InstrumentDatabase activeDAW={activeDAW} instrumentName={selectedInstrument} genre={selectedGenre} />}
            {activeTab === ToolType.VOCAL_BOOTH && <VocalBooth activeDAW={activeDAW} genre={selectedGenre} />}
            {activeTab === ToolType.PLUGIN_ADVISOR && <PluginAdvisor activeDAW={activeDAW} selectedGenre={selectedGenre} />}
            {activeTab === ToolType.CALCULATOR && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EngineeringCalculators />
                <div className="bg-zinc-900/30 p-8 rounded-2xl border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-zinc-300 font-semibold mb-2">More Tools Incoming</h3>
                  <p className="text-zinc-500 text-sm max-w-[200px]">Phase alignment and Fletcher-Munson compensation modules are in development.</p>
                </div>
              </div>
            )}
            {activeTab === ToolType.ANALYZER && <AudioAnalyzer selectedGenre={selectedGenre} />}
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}} />
    </div>
  );
};

export default App;
