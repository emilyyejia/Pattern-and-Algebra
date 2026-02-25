
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { LevelComponentProps } from '../types';
import GlossaryModal, { GlossaryEntry } from '../components/GlossaryModal';
import GlossaryButton from '../components/GlossaryButton';
import LevelCompleteModal from '../components/LevelCompleteModal';

const PATTERN_GLOSSARY: GlossaryEntry[] = [
  {
    term: "repeating pattern",
    definition: "A pattern that repeats the exact same sequence of items over and over.",
    example: "🔴 🔵 🔴 🔵 is a repeating pattern."
  },
  {
    term: "growing pattern",
    definition: "A pattern where the values increase or decrease by a specific amount each step.",
    example: "2, 4, 8, 16... is a growing pattern."
  }
];

const PatternLevel2: React.FC<LevelComponentProps> = ({ onComplete, onExit, onNext, isFinalLevelInLesson = false }) => {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [finalStars, setFinalStars] = useState(0);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const tasks = [
    { sequence: '🔴 🟢 🔴 🟢 🔴 🟢', options: ['Repeating', 'Growing'], correct: 0 },
    { sequence: '5, 10, 15, 20, 25', options: ['Repeating', 'Growing'], correct: 1 },
    { sequence: '⭐ 🌙 ⭐ 🌙 ⭐ 🌙', options: ['Repeating', 'Growing'], correct: 0 },
    { sequence: '2, 4, 8, 16, 32', options: ['Repeating', 'Growing'], correct: 1 },
  ];

  const handleChoice = (idx: number) => {
    if (idx === tasks[step].correct) {
      if (step < tasks.length - 1) setStep(s => s + 1);
      else {
        const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1;
        setFinalStars(stars);
        setShowModal(true);
        onComplete(stars);
      }
    } else {
      errors < 99 && setErrors(e => e + 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      {document.getElementById('portal-progress-dots') && ReactDOM.createPortal(
        <div className="flex justify-center gap-3">
          {tasks.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === step ? 'bg-sky-400 scale-125 border-2 border-white' : i < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          ))}
        </div>,
        document.getElementById('portal-progress-dots')!
      )}

      {document.getElementById('instruction-trigger-portal') && ReactDOM.createPortal(
        <GlossaryButton onClick={() => setIsGlossaryOpen(true)} />,
        document.getElementById('instruction-trigger-portal')!
      )}

      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} entries={PATTERN_GLOSSARY} />

      <div className="flex flex-col items-center pt-16 w-full max-w-2xl px-4 animate-fade-in text-center">
        <p className="text-3xl mb-12 font-bold text-white">Identify the pattern type.</p>

        <div className="bg-[#121B2B] p-12 rounded-[40px] border border-slate-800 mb-10 w-full flex items-center justify-center min-h-[240px] shadow-2xl">
          <div className="text-5xl bg-slate-900/50 p-8 rounded-3xl shadow-inner border border-slate-700 text-white font-black italic">
            {tasks[step].sequence}
          </div>
        </div>

        <div className="flex gap-6 w-full">
            {tasks[step].options.map((opt, i) => (
                <button
                    key={opt}
                    onClick={() => handleChoice(i)}
                    className="flex-1 bg-slate-800 hover:bg-sky-600 text-white p-8 rounded-3xl text-2xl font-black transition-all border-b-8 border-slate-900 active:border-b-0 active:translate-y-2 uppercase italic"
                >
                    {opt}
                </button>
            ))}
        </div>
      </div>

      <LevelCompleteModal
        isOpen={showModal}
        stars={finalStars}
        onNext={() => onNext ? onNext() : onExit?.()}
        onReplay={() => {
          setStep(0);
          setErrors(0);
          setShowModal(false);
        }}
        isFinalLevel={isFinalLevelInLesson}
      />
    </div>
  );
};
export default PatternLevel2;
