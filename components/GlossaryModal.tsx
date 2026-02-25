
import React from 'react';

export interface GlossaryEntry {
  term: string;
  definition: string;
  example: React.ReactNode;
}

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: GlossaryEntry[];
}

const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose, entries }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[200] p-4 md:p-8 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#0F172A]/95 border border-slate-800 rounded-[32px] w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-10 py-8 border-b border-slate-800/50">
          <h2 className="text-5xl font-black text-[#38BDF8] italic tracking-tighter">Glossary</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-2"
            aria-label="Close glossary"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {entries.map((entry, idx) => (
            <div 
              key={idx} 
              className="bg-[#1E293B] rounded-3xl p-8 flex flex-col md:flex-row gap-8 border border-slate-700 shadow-xl transition-transform hover:scale-[1.01]"
            >
              {/* Term Column */}
              <div className="md:w-1/4">
                <h3 className="text-3xl font-black text-[#38BDF8] italic lowercase tracking-tight">
                  {entry.term}
                </h3>
              </div>

              {/* Definition Column */}
              <div className="md:w-1/2">
                <p className="text-slate-200 text-xl leading-relaxed font-medium">
                  {entry.definition}
                </p>
              </div>

              {/* Example Column */}
              <div className="md:w-1/4 bg-[#0F172A] p-6 rounded-2xl border-l-[6px] border-emerald-500 shadow-inner">
                <div className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">Example</div>
                <div className="text-slate-300 text-lg leading-snug">
                  {entry.example}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
          border: 4px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default GlossaryModal;
