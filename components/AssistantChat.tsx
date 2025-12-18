
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TranscriptionMessage, SelectedGenre, DAWType } from '../types';
import { GENRE_DATABASE } from '../data/genres';
import { DAW_PROFILES } from '../data/daws';
import ExportMenu from './ExportMenu';
import { exportToPDF, exportToDocx, exportToImage } from '../utils/exportUtils';

interface AssistantChatProps {
  activeDAW: DAWType;
  selectedGenre: SelectedGenre | null;
  setSelectedGenre: (genre: SelectedGenre) => void;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ activeDAW, selectedGenre, setSelectedGenre }) => {
  const [messages, setMessages] = useState<TranscriptionMessage[]>([
    { role: 'assistant', text: `Welcome to the Engineering Suite. I've been calibrated for ${activeDAW}. Select your project genre from the hub above to begin.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenreHub, setShowGenreHub] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleExport = async (format: 'pdf' | 'docx' | 'png' | 'jpg') => {
    const title = `Production Session - ${selectedGenre?.sub || 'General'} - ${activeDAW}`;
    const filename = `session_${selectedGenre?.sub.toLowerCase() || 'general'}_${Date.now()}`;
    
    if (format === 'pdf' || format === 'docx') {
      const sections = messages.map((m) => ({
        heading: m.role === 'user' ? 'ENGINEER' : 'SONIC AI',
        content: m.text
      }));
      if (format === 'pdf') await exportToPDF(title, sections, filename);
      else await exportToDocx(title, sections, filename);
    } else {
      await exportToImage('chat-messages-area', format, filename);
    }
  };

  const filteredGenres = GENRE_DATABASE.map(cat => ({
    ...cat,
    subgenres: cat.subgenres.filter(sub => 
      sub.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.subgenres.length > 0);

  const getInstrumentation = (genreName: string) => {
    const cat = GENRE_DATABASE.find(c => c.name === genreName || c.subgenres.includes(genreName));
    return cat?.coreInstruments || [];
  };

  const handleSelectGenre = (catName: string, subName: string) => {
    setSelectedGenre({ cat: catName, sub: subName });
    setShowGenreHub(false);
    const instruments = getInstrumentation(catName);
    const daw = DAW_PROFILES[activeDAW];
    
    const introText = `I've set my profile to **${subName}** (${catName}) using **${activeDAW}** logic. 
    
    Typical instrumentation for this style includes: ${instruments.join(', ')}. 
    
    In ${activeDAW}, we'll focus on ${daw.workflowFocus}. How can I help you mix this project?`;
    
    setMessages(prev => [...prev, { role: 'assistant', text: introText }]);
  };

  const handleSend = async (customMessage?: string) => {
    const userMessage = customMessage || input.trim();
    if (!userMessage || isLoading) return;

    if (!customMessage) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const daw = DAW_PROFILES[activeDAW];

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })), { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: `You are a world-class mixing and mastering engineer. 
          The current project genre is ${selectedGenre ? selectedGenre.sub : 'General'}.
          The user is using ${activeDAW}.
          
          DAW SPECIFIC LOGIC:
          - Use ${activeDAW} terminology: ${daw.terminology.join(', ')}.
          - Recommend these ${activeDAW} stock plugins where appropriate: ${daw.stockPlugins.join(', ')}.
          - Adhere to this workflow focus: ${daw.workflowFocus}.
          - ${daw.reasoningInjection}

          When providing advice:
          1. SONIC CHARACTERISTICS: Mention frequency balance typical for ${selectedGenre?.sub}.
          2. INSTRUMENTATION: Focus on ${getInstrumentation(selectedGenre?.cat || '').join(', ')}.
          3. COMPRESSION: Suggest specific attack/release times relative to this genre's groove.
          4. REVERB/SPACE: Recommend spatial treatment (e.g., dry for funk, wet for ambient).
          
          Use Markdown. Be precise and professional.`,
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "I'm sorry, I couldn't process that request." }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "There was an error connecting to the engineering database." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden backdrop-blur-md relative">
      {/* Genre Selection Header */}
      <div className="p-4 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl">
            {selectedGenre ? '🎵' : '🔍'}
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Studio Calibration</h3>
            <p className="text-sm font-semibold text-white">
              {selectedGenre ? `${selectedGenre.sub} @ ${activeDAW}` : `Calibrating for ${activeDAW}...`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ExportMenu onExport={handleExport} />
          <button 
            onClick={() => setShowGenreHub(!showGenreHub)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-300 transition-all border border-zinc-700"
          >
            {showGenreHub ? 'Close Hub' : 'Browse Genres'}
          </button>
        </div>
      </div>

      {/* Genre Search Overlay */}
      {showGenreHub && (
        <div className="absolute inset-x-0 top-[73px] bottom-0 z-50 bg-[#0a0a0b]/95 backdrop-blur-xl p-6 flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mb-6">
            <input 
              type="text"
              placeholder="Search 1,000+ genres (e.g. 'Liquid Funk', 'Delta Blues')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
            {filteredGenres.map(cat => (
              <div key={cat.name} className="space-y-2">
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-8 h-px bg-blue-500/30"></span>
                  {cat.name}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {cat.subgenres.map(sub => (
                    <button
                      key={sub}
                      onClick={() => handleSelectGenre(cat.name, sub)}
                      className="text-left px-3 py-2 bg-zinc-900/50 hover:bg-blue-600/20 border border-zinc-800 hover:border-blue-500/50 rounded-lg text-xs text-zinc-400 hover:text-blue-200 transition-all"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div 
        id="chat-messages-area"
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-950/20" 
        ref={scrollRef}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                : 'bg-zinc-800/80 text-zinc-200 border border-zinc-700 rounded-tl-none'
            }`}>
              <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('#') ? 'font-bold text-white mt-2' : ''}>
                    {line.includes('**') ? 
                      line.split('**').map((part, pi) => pi % 2 === 1 ? <strong key={pi}>{part}</strong> : part) 
                      : line
                    }
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/80 p-4 rounded-2xl rounded-tl-none border border-zinc-700 flex gap-2 items-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-tighter">Sonic Engine Computing</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
        className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedGenre ? `Ask for ${selectedGenre.sub} mixing tips in ${activeDAW}...` : `Calibrating for ${activeDAW}...`}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-zinc-600"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>
  );
};

export default AssistantChat;
