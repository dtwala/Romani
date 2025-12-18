
import React, { useState } from 'react';

interface ExportMenuProps {
  onExport: (format: 'pdf' | 'docx' | 'png' | 'jpg') => void;
  isLoading?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ onExport, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-all group"
      >
        <span className="text-sm font-bold text-zinc-300">
          {isLoading ? 'Generating...' : 'Export Session'}
        </span>
        <svg 
          className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-zinc-800 bg-zinc-950/50">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2">Document Formats</span>
          </div>
          <button 
            onClick={() => { onExport('pdf'); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 text-xs text-zinc-300 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-between"
          >
            <span>PDF Document</span>
            <span className="text-[10px] opacity-50 font-mono">.pdf</span>
          </button>
          <button 
            onClick={() => { onExport('docx'); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 text-xs text-zinc-300 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-between"
          >
            <span>Word (DOCX)</span>
            <span className="text-[10px] opacity-50 font-mono">.docx</span>
          </button>
          
          <div className="p-2 border-b border-t border-zinc-800 bg-zinc-950/50">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2">Visual Snapshot</span>
          </div>
          <button 
            onClick={() => { onExport('png'); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 text-xs text-zinc-300 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-between"
          >
            <span>PNG Image</span>
            <span className="text-[10px] opacity-50 font-mono">.png</span>
          </button>
          <button 
            onClick={() => { onExport('jpg'); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 text-xs text-zinc-300 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-between"
          >
            <span>JPEG Image</span>
            <span className="text-[10px] opacity-50 font-mono">.jpg</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
