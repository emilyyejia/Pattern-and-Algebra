
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { LevelComponentProps } from '../types';
import GlossaryModal, { GlossaryEntry } from '../components/GlossaryModal';
import GlossaryButton from '../components/GlossaryButton';
import LevelCompleteModal from '../components/LevelCompleteModal';

const PATTERN_GLOSSARY: GlossaryEntry[] = [
  {
    term: "pattern rule",
    definition: "A clear instruction that explains how to get from one value to the next.",
    example: "Rule: '+4' means 1, 5, 9, 13..."
  },
  {
    term: "term position",
    definition: "The number in line (1st, 2nd, 3rd) that tells you where a value is.",
    example: "In 2, 4, 6, the 3rd term is 6."
  }
];

type ValueTask = {
  type: 'missing' | 'gap' | 'jump';
  sequence: (number | string)[];
  answer: string;
  instruction: string;
  hint: string;
};

const PatternLevel5: React.FC<LevelComponentProps> = ({ onComplete, onExit, onNext, isFinalLevelInLesson = false }) => {
  const [taskIdx, setTaskIdx] = useState(0);
  const [errors, setErrors] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const tasks: ValueTask[] = [
    { 
      type: 'missing', 
      sequence: [2, 4, 6, 8, '?'], 
      answer: '10', 
      instruction: "What number comes next?", 
      hint: "What is the difference between 2 and 4? Does the same change happen again?" 
    },
    { 
      type: 'missing', 
      sequence: [10, 20, 30, 40, '?'], 
      answer: '50', 
      instruction: "What number comes next?", 
      hint: "Each number goes up by the same amount — what is it?" 
    },
    { 
      type: 'missing', 
      sequence: [5, 8, 11, 14, '?'], 
      answer: '17', 
      instruction: "Extend the pattern!", 
      hint: "Find the difference between 5 and 8. Does that same difference appear again?" 
    },
    { 
      type: 'gap', 
      sequence: [3, 7, '?', 15, 19], 
      answer: '11', 
      instruction: "Find the missing piece!", 
      hint: "Almost! Look closely at how the numbers change each time. How many steps are they moving?" 
    },
    { 
      type: 'gap', 
      sequence: [100, 95, 90, '?', 80], 
      answer: '85', 
      instruction: "Fill the gap!", 
      hint: "The numbers are going down — what number sits exactly halfway between 90 and 80?" 
    },
    { 
      type: 'jump', 
      sequence: [2, 4, 6, 8], 
      answer: '20', 
      instruction: "The big jump: What is term 10?", 
      hint: "Almost! Find the jump from term 1 to term 2, then repeat it until term 10." 
    }
  ];

  const currentTask = tasks[taskIdx];

  const handleCheck = (val: string) => {
    if (feedback === 'correct') return;

    if (val.trim() === currentTask.answer) {
      setFeedback('correct');
      setTimeout(() => {
        if (taskIdx < tasks.length - 1) {
          setTaskIdx(i => i + 1);
          setInputVal('');
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
    }
  };

  return (
    <div className="w-full h-full relative overflow-y-auto bg-[#0F172A] flex flex-col items-center py-12 px-6">
      {/* Progress Portal */}
      {document.getElementById('portal-progress-dots') && ReactDOM.createPortal(
        <div className="flex justify-center gap-3">
          {tasks.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === taskIdx ? 'bg-sky-400 scale-125 border-2 border-white' : i < taskIdx ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          ))}
        </div>,
        document.getElementById('portal-progress-dots')!
      )}

      {/* Glossary Portal */}
      {document.getElementById('instruction-trigger-portal') && ReactDOM.createPortal(
        <GlossaryButton onClick={() => setIsGlossaryOpen(true)} />,
        document.getElementById('instruction-trigger-portal')!
      )}

      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} entries={PATTERN_GLOSSARY} />

      <div className="flex flex-col items-center animate-fade-in text-center w-full max-w-2xl pt-4">
        <p className="text-slate-400 text-lg mb-8 font-bold tracking-wide">Task {taskIdx + 1} of {tasks.length}</p>

        <div className={`bg-slate-800 p-10 md:p-14 rounded-[50px] border-4 transition-all duration-300 mb-10 w-full shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[450px] justify-center ${feedback === 'incorrect' ? 'border-red-500 animate-shake' : feedback === 'correct' ? 'border-emerald-500 scale-105' : 'border-slate-700'}`}>
            
            <h2 className="text-3xl font-bold text-white mb-10">{currentTask.instruction}</h2>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
                {currentTask.sequence.map((item, i) => (
                    <div key={i} className={`w-20 h-20 flex flex-col items-center justify-center rounded-2xl border-2 font-black text-2xl italic shadow-inner transition-all
                        ${item === '?' ? 'bg-sky-500/20 border-sky-500 text-sky-400 animate-pulse' : 'bg-slate-900 border-slate-700 text-white'}`}>
                        {currentTask.type === 'jump' && <span className="text-[10px] text-slate-500 uppercase mb-1">Term {i+1}</span>}
                        {item}
                    </div>
                ))}
            </div>

            <form 
                onSubmit={(e) => { e.preventDefault(); handleCheck(inputVal); }}
                className="flex flex-col items-center gap-6 w-full"
            >
                <input
                    type="number"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    className="w-48 bg-slate-900 border-4 border-slate-700 rounded-3xl p-6 text-6xl text-center font-black text-white focus:border-sky-500 focus:outline-none italic shadow-inner"
                    placeholder="?"
                    autoFocus
                />
                <button 
                    type="submit" 
                    disabled={!inputVal}
                    className="bg-sky-600 hover:bg-sky-500 disabled:opacity-30 text-white font-black py-5 px-16 rounded-2xl text-2xl shadow-xl uppercase italic transition-all active:scale-95 border-b-8 border-sky-800 active:border-b-0 active:translate-y-2"
                >
                    Check Value →
                </button>
            </form>

            {feedback === 'incorrect' && (
                <p className="mt-8 text-red-400 font-bold italic animate-fade-in">{currentTask.hint}</p>
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
          setInputVal('');
          setShowModal(false);
          setFeedback(null);
        }}
        isFinalLevel={isFinalLevelInLesson}
      />
    </div>
  );
};

export default PatternLevel5;
