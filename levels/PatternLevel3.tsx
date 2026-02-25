
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { LevelComponentProps } from '../types';
import GlossaryModal, { GlossaryEntry } from '../components/GlossaryModal';
import GlossaryButton from '../components/GlossaryButton';
import LevelCompleteModal from '../components/LevelCompleteModal';

const PATTERN_GLOSSARY: GlossaryEntry[] = [
  {
    term: "pattern",
    definition: "A sequence of numbers that follows a specific rule.",
    example: "10, 20, 30... is a pattern that adds 10."
  },
  {
    term: "rule",
    definition: "The mathematical step used to find the next number.",
    example: "If the rule is '+5', the next number after 10 is 15."
  }
];

type RuleTask = {
  seq: number[];
  options: string[];
  correct: number;
  hint: string;
};

const PatternLevel3: React.FC<LevelComponentProps> = ({ onComplete, onExit, onNext, isFinalLevelInLesson = false }) => {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [finalStars, setFinalStars] = useState(0);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const tasks: RuleTask[] = [
    { 
      seq: [11, 15, 19, 23, 27, 31], 
      options: ['Add 2 each time', 'Add 4 each time', 'Multiply 2 each time', 'Multiply 4 each time'], 
      correct: 1,
      hint: "How do the numbers change each step?"
    },
    { 
      seq: [20, 15, 10, 5, 0], 
      options: ['Add 5 each time', 'Add 10 each time', 'Subtract 10 each time', 'Subtract 5 each time'], 
      correct: 3,
      hint: "How do the numbers change each step?"
    },
    { 
      seq: [5, 10, 20, 40, 80], 
      options: ['Add 5 each time', 'Add 10 each time', 'Multiply 2 each time', 'Multiply 5 each time'], 
      correct: 2,
      hint: "How do the numbers change each step?"
    },
    { 
      seq: [7, 9, 12, 16, 21], 
      options: ['Add 2 each time', 'Add 3 each time', 'Add 2, then 3, then 4, then 5', 'Multiply by 2 each time'], 
      correct: 2,
      hint: "How do the numbers change each step?"
    },
    { 
      seq: [10, 20, 30, 40], 
      options: ['Add 10 each time', 'Double the number each time', 'Add 20 each time'], 
      correct: 0,
      hint: "How do the numbers change each step?"
    }
  ];

  const handleChoice = (idx: number) => {
    if (feedback === 'correct') return;

    if (idx === tasks[step].correct) {
      setFeedback('correct');
      setTimeout(() => {
        if (step < tasks.length - 1) {
          setStep(s => s + 1);
          setFeedback(null);
        } else {
          const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1;
          setFinalStars(stars);
          setShowModal(true);
          onComplete(stars);
        }
      }, 800);
    } else {
      setErrors(e => e + 1);
      setFeedback('incorrect');
    }
  };

  const currentTask = tasks[step];

  return (
    <div className="w-full h-full relative overflow-y-auto bg-[#0F172A] flex flex-col items-center py-12 px-6">
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

      <div className="flex flex-col items-center animate-fade-in text-center w-full max-w-2xl pt-8">
        <p className="text-3xl font-bold text-white mb-10">What is the rule?</p>
        
        <div className={`bg-slate-800 p-12 rounded-[40px] border-4 transition-all duration-300 mb-10 w-full shadow-2xl relative ${feedback === 'incorrect' ? 'border-red-500 animate-shake' : feedback === 'correct' ? 'border-emerald-500 scale-105' : 'border-slate-700'}`}>
            <div className="flex flex-wrap gap-4 justify-center mb-12 text-4xl font-black text-white">
                {currentTask.seq.map((n, i) => (
                    <div key={i} className="w-20 h-20 bg-slate-900 flex items-center justify-center rounded-2xl border border-slate-700 italic shadow-inner">
                        {n}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 w-full">
                {currentTask.options.map((opt, i) => (
                    <button
                        key={opt}
                        onClick={() => handleChoice(i)}
                        className="bg-slate-900 hover:bg-sky-600 text-white p-6 rounded-2xl text-xl font-black border-2 border-slate-700 hover:border-sky-400 transition-all uppercase italic shadow-lg active:scale-95"
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {feedback === 'incorrect' && (
                <p className="mt-8 text-red-400 font-bold italic animate-fade-in">{currentTask.hint}</p>
            )}
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
          setFeedback(null);
        }}
        isFinalLevel={isFinalLevelInLesson}
      />
    </div>
  );
};
export default PatternLevel3;
