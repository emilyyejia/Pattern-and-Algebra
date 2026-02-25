
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { LevelComponentProps } from '../types';
import GlossaryModal, { GlossaryEntry } from '../components/GlossaryModal';
import GlossaryButton from '../components/GlossaryButton';
import LevelCompleteModal from '../components/LevelCompleteModal';

const PATTERN_GLOSSARY: GlossaryEntry[] = [
  {
    term: "pattern core",
    definition: "The shortest part of a repeating pattern that repeats over and over.",
    example: "In 🔴 🔵 🔴 🔵, the core is 🔴 🔵."
  },
  {
    term: "geometric growth",
    definition: "A pattern that grows by multiplying the same number each time.",
    example: "2, 4, 8, 16... (Rule: x2)"
  }
];

type MasteryTask = {
  type: 'core' | 'glitch' | 'classify' | 'change';
  sequence: string | (number | string)[];
  answer: string;
  options: string[];
  instruction: string;
  hint: string;
};

const PatternLevelMastery: React.FC<LevelComponentProps> = ({ onComplete, onExit, onNext }) => {
  const [taskIdx, setTaskIdx] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const tasks: MasteryTask[] = [
    { 
      type: 'core', 
      sequence: '🔴 🔵 🔵 🔴 🔵 🔵 🔴', 
      answer: '🔴 🔵 🔵', 
      options: ['🔴 🔵', '🔴 🔵 🔵', '🔵 🔵 🔴'],
      instruction: "Find the pattern core.", 
      hint: "What is the repeating pattern?" 
    },
    { 
      type: 'glitch', 
      sequence: [10, 20, 30, 35, 50, 60], 
      answer: 'Step 4', 
      options: ['Step 2', 'Step 3', 'Step 4', 'Step 5'],
      instruction: "The pattern is add 10 each time. Which step does not follow the rule?", 
      hint: "Which step did not add 10 from the step before?" 
    },
    { 
      type: 'classify', 
      sequence: [3, 9, 27, 81], 
      answer: 'Multiplying', 
      options: ['Adding', 'Multiplying', 'Repeating'],
      instruction: "Look at the pattern. How does it grow?", 
      hint: "Are we adding the same amount, or multiplying?" 
    },
    { 
      type: 'glitch', 
      sequence: ['⭐', '🌙', '⭐', '⭐', '🌙', '⭐'], 
      answer: 'None of the above', 
      options: ['Step 2', 'Step 4', 'Step 5', 'None of the above'],
      instruction: "The pattern core is ⭐ 🌙 ⭐. Where is the mistake?", 
      hint: "Check if the pattern restarts correctly after the 3rd item." 
    },
    { 
      type: 'change', 
      sequence: [100, 50, 25, 12.5], 
      answer: 'shrinking', 
      options: ['growing', 'shrinking', 'repeating'],
      instruction: "Look at the number sequence. How does the pattern change each time?", 
      hint: "Are the numbers getting bigger or smaller?" 
    }
  ];

  const currentTask = tasks[taskIdx];

  const handleCheck = (val: string) => {
    if (feedback === 'correct') return;

    if (val === currentTask.answer) {
      setFeedback('correct');
      setTimeout(() => {
        if (taskIdx < tasks.length - 1) {
          setTaskIdx(i => i + 1);
          setFeedback(null);
        } else {
          const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1;
          setEarnedStars(stars);
          setShowModal(true);
          onComplete(stars);
        }
      }, 800);
    } else {
      setErrors(e => e + 1);
      setFeedback('incorrect');
      // Hint stays for 3 seconds as requested
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="w-full h-full relative overflow-y-auto bg-[#0F172A] flex flex-col items-center py-12 px-6">
      {document.getElementById('portal-progress-dots') && ReactDOM.createPortal(
        <div className="flex justify-center gap-3">
          {tasks.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === taskIdx ? 'bg-sky-400 scale-125 border-2 border-white' : i < taskIdx ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          ))}
        </div>,
        document.getElementById('portal-progress-dots')!
      )}

      {document.getElementById('instruction-trigger-portal') && ReactDOM.createPortal(
        <GlossaryButton onClick={() => setIsGlossaryOpen(true)} />,
        document.getElementById('instruction-trigger-portal')!
      )}

      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} entries={PATTERN_GLOSSARY} />

      <div className="flex flex-col items-center animate-fade-in text-center w-full max-w-3xl pt-4">
        <h1 className="text-4xl font-black text-sky-400 mb-2 uppercase tracking-tighter italic">Mastery: Pattern Detective 🔍</h1>
        <p className="text-slate-400 text-lg mb-8 italic font-bold uppercase tracking-widest">Case {taskIdx + 1} of {tasks.length}</p>

        <div className={`bg-slate-800 p-10 md:p-14 rounded-[50px] border-4 transition-all duration-300 mb-10 w-full shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[450px] justify-center ${feedback === 'incorrect' ? 'border-red-500 animate-shake' : feedback === 'correct' ? 'border-emerald-500 scale-105' : 'border-slate-700'}`}>
            
            <h2 className="text-2xl font-black text-white mb-10 uppercase italic tracking-tight">{currentTask.instruction}</h2>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
                {Array.isArray(currentTask.sequence) ? (
                  currentTask.sequence.map((item, i) => (
                    <div key={i} className="w-20 h-20 flex flex-col items-center justify-center rounded-2xl border-2 bg-slate-900 border-slate-700 text-white font-black text-2xl italic shadow-inner">
                        <span className="text-[10px] text-slate-500 uppercase mb-1">Step {i+1}</span>
                        {item}
                    </div>
                  ))
                ) : (
                  <div className="text-5xl bg-slate-900/50 p-10 rounded-3xl border-2 border-slate-700 text-white font-black italic tracking-widest">
                    {currentTask.sequence}
                  </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {currentTask.options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => handleCheck(opt)}
                        className="bg-slate-900 hover:bg-sky-600 text-white p-6 rounded-2xl text-lg font-black border-2 border-slate-700 hover:border-sky-400 transition-all uppercase italic shadow-lg active:scale-95"
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {feedback === 'incorrect' && (
                <div className="mt-8 bg-red-500/10 border border-red-500/30 p-4 rounded-xl animate-fade-in">
                    <p className="text-red-400 font-bold italic">Hint: {currentTask.hint}</p>
                </div>
            )}
        </div>
      </div>

      <LevelCompleteModal
        isOpen={showModal}
        stars={earnedStars}
        onNext={() => onNext ? onNext() : onExit?.()}
        onReplay={() => {
          setTaskIdx(0);
          setErrors(0);
          setShowModal(false);
          setFeedback(null);
        }}
      />
    </div>
  );
};

export default PatternLevelMastery;
