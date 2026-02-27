
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import type { LevelComponentProps } from '../types';
import GlossaryModal, { GlossaryEntry } from '../components/GlossaryModal';
import GlossaryButton from '../components/GlossaryButton';
import LevelCompleteModal from '../components/LevelCompleteModal';

const PATTERN_GLOSSARY: GlossaryEntry[] = [
  {
    term: "term",
    definition: "The position in a pattern (1st, 2nd, 3rd...).",
    example: "Position 1 is term 1."
  },
  {
    term: "value",
    definition: "The actual number at that position.",
    example: "If the first number is 10, the value is 10."
  }
];

const PatternLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, onNext, isFinalLevelInLesson = false }) => {
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number | null>>({ 1: null, 2: null, 3: null, 4: null });
  const [errors, setErrors] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [finalStars, setFinalStars] = useState(0);

  // Shuffle the values on initialization
  const values = useMemo(() => {
    return [2, 4, 6, 8].sort(() => Math.random() - 0.5);
  }, []);

  const handleMatch = (val: number) => {
    if (!selectedTerm) return;
    if (val === selectedTerm * 2) {
      setMatches(prev => ({ ...prev, [selectedTerm]: val }));
      setSelectedTerm(null);
      setShowHint(false);
    } else {
      setErrors(e => e + 1);
      setShowHint(true);
      setSelectedTerm(null);
    }
  };

  const matchedCount = Object.values(matches).filter(v => v !== null).length;
  const allMatched = matchedCount === 4;

  const handleFinish = () => {
    const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1;
    setFinalStars(stars);
    setShowWin(true);
    onComplete(stars);
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-4">
      {document.getElementById('portal-progress-dots') && ReactDOM.createPortal(
        <div className="flex justify-center gap-3">
          <div className="bg-sky-400 w-3 h-3 rounded-full border-2 border-white scale-125" />
        </div>,
        document.getElementById('portal-progress-dots')!
      )}

      {document.getElementById('instruction-trigger-portal') && ReactDOM.createPortal(
        <GlossaryButton onClick={() => setIsGlossaryOpen(true)} />,
        document.getElementById('instruction-trigger-portal')!
      )}

      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} entries={PATTERN_GLOSSARY} />

      <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in py-8 relative">
        <div className="text-center mb-12">
          <p className="text-3xl font-bold text-white mb-6">Double the term number</p>

          {/* Centered Hint Area */}
          <div className="h-16 flex items-center justify-center">
            {showHint && (
              <div className="bg-red-500 text-white p-4 rounded-xl shadow-xl animate-fade-in max-w-md w-full z-50">
                <p className="font-bold italic">Double means multiply by two. Multiply the term number by 2.</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mb-12">
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-white mb-2">1. Select a term</h3>
            {[1, 2, 3, 4].map(t => (
              <button
                key={t}
                onClick={() => !matches[t] && setSelectedTerm(t)}
                disabled={!!matches[t]}
                className={`group h-24 rounded-3xl border-4 flex items-center justify-between px-8 transition-all
                  ${matches[t] ? 'bg-emerald-500 border-emerald-600 shadow-none' : 
                    selectedTerm === t ? 'bg-sky-500/20 border-sky-400 scale-105 shadow-xl shadow-sky-500/10' : 
                    'bg-[#121B2B] border-slate-800 hover:border-slate-700'}
                `}
              >
                <div className="text-left">
                  <span className="text-[10px] text-slate-500 font-black uppercase italic block">Position</span>
                  <span className="text-3xl font-black text-white italic">term {t}</span>
                </div>
                <div className="text-right">
                  {matches[t] ? (
                    <div className="bg-white/20 px-4 py-2 rounded-xl text-white font-black italic whitespace-nowrap">term value: {matches[t]}</div>
                  ) : (
                    <div className={`w-8 h-8 rounded-full border-2 border-dashed ${selectedTerm === t ? 'border-sky-400 animate-pulse' : 'border-slate-700'}`} />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-white mb-2">2. Pick the correct value</h3>
            <div className="grid grid-cols-2 gap-4 h-full">
              {values.map(v => {
                const isMatched = Object.values(matches).includes(v);
                return (
                  <button
                    key={v}
                    onClick={() => handleMatch(v)}
                    disabled={isMatched || !selectedTerm}
                    className={`rounded-[32px] border-4 flex flex-col items-center justify-center transition-all
                      ${isMatched ? 'opacity-0 pointer-events-none scale-90' : 
                        !selectedTerm ? 'bg-slate-800/30 border-slate-800 cursor-not-allowed grayscale' : 
                        'bg-[#1E293B] border-emerald-500 shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-95'}
                    `}
                  >
                    <span className="text-5xl font-black text-white italic">{v}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button 
          onClick={handleFinish}
          disabled={!allMatched}
          className={`py-6 px-24 rounded-3xl text-3xl font-black uppercase italic transition-all shadow-2xl
            ${allMatched ? 'bg-emerald-500 hover:bg-emerald-400 text-white scale-110' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}
          `}
        >
          {allMatched ? "Great Work! →" : `${matchedCount}/4 Matched`}
        </button>
      </div>

      <LevelCompleteModal
        isOpen={showWin}
        stars={finalStars}
        onNext={() => onNext ? onNext() : onExit?.()}
        onReplay={() => {
          setMatches({ 1: null, 2: null, 3: null, 4: null });
          setErrors(0);
          setShowWin(false);
          setShowHint(false);
        }}
        isFinalLevel={isFinalLevelInLesson}
      />
    </div>
  );
};

export default PatternLevel1;
