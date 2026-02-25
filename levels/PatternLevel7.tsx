
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { LevelComponentProps } from '../types';
import LevelCompleteModal from '../components/LevelCompleteModal';

const PatternLevel7: React.FC<LevelComponentProps> = ({ onComplete, onExit, onNext, isFinalLevelInLesson = false }) => {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState(1); // For stage-based questions: 1=Identify, 2=Explanation
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  
  // For Q1 Multi-select
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const questions = [
    {
      // SPECIAL QUESTION 1
      type: 'multi',
      instruction: "A linear pattern adds or subtracts the same amount each time. Select TWO number patterns that are linear.",
      options: [
        { label: "2, 4, 6, 8, 10", isCorrect: true },
        { label: "10, 20, 40, 80, 160", isCorrect: false },
        { label: "100, 90, 80, 70, 60, 50", isCorrect: true },
        { label: "120, 60, 30, 15, 7.5", isCorrect: false }
      ],
      correctFeedback: "Great job! When a pattern is growing or shrinking by the same amount each time, it is called a LINEAR PATTERN.",
      hint: "Find the patterns where the change is always the same."
    },
    { 
      type: 'standard',
      label: "17, 14, 11, 8, 5", 
      isLinear: true, 
      correctExplanation: "It subtracts 3 each step", 
      options: ["It subtracts 3 each step", "It divides by 2 each time"] 
    },
    { 
      type: 'standard',
      label: "80, 40, 20, 10, 5", 
      isLinear: false, 
      correctExplanation: "It divides by 2 each time", 
      options: ["It divides by 2 each time", "It subtracts 40 each time"] 
    },
    { 
      type: 'standard',
      label: "5, 10, 15, 20, 25...", 
      isLinear: true, 
      correctExplanation: "It adds 5 each step", 
      options: ["It adds 5 each step", "It adds a random amount"] 
    },
    { 
      type: 'standard',
      label: "3, 6, 12, 24...", 
      isLinear: false, 
      correctExplanation: "It doubles each step", 
      options: ["It adds 3 each step", "It doubles each step"] 
    },
  ];

  const currentQ = questions[index];

  const handleMultiSelect = (idx: number) => {
    // Clear feedback and allow reselection when user clicks after getting wrong answer
    if (feedback === 'incorrect') {
      setFeedback(null);
      setSelectedIndices([idx]);
      return;
    }
    if (feedback === 'correct') return;
    
    setSelectedIndices(prev => {
        if (prev.includes(idx)) return prev.filter(i => i !== idx);
        if (prev.length < 2) return [...prev, idx];
        return prev;
    });
  };

  const handleMultiSubmit = () => {
    // FIX: Asserting currentQ.options as the object array type to access 'isCorrect' property which only exists on 'multi' type questions. 
    // We removed the unused 'correctAnswers' variable to clean up the logic.
    const multiOptions = currentQ.options as { label: string; isCorrect: boolean }[];
    // Find absolute indices of correct answers
    const realCorrectIndices = multiOptions.map((o, i) => o.isCorrect ? i : -1).filter(i => i !== -1);
    
    const isPerfect = selectedIndices.length === 2 && selectedIndices.every(i => realCorrectIndices.includes(i));

    if (isPerfect) {
        setFeedback('correct');
        setTimeout(() => {
            setIndex(i => i + 1);
            setFeedback(null);
            setSelectedIndices([]);
        }, 3000);
    } else {
        setErrors(e => e + 1);
        setFeedback('incorrect');
    }
  };

  const handleLinearChoice = (choice: boolean) => {
    if (feedback === 'correct') return;
    if (choice === currentQ.isLinear) {
      setFeedback('correct');
      setTimeout(() => {
        setStage(2);
        setFeedback(null);
      }, 600);
    } else {
      setErrors(e => e + 1);
      setFeedback('incorrect');
    }
  };

  const handleExplanationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === currentQ.correctExplanation) {
      setFeedback('correct');
      setTimeout(() => {
        if (index < questions.length - 1) {
          setIndex(i => i + 1);
          setStage(1);
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
      {document.getElementById('portal-progress-dots') && ReactDOM.createPortal(
        <div className="flex justify-center gap-3">
          {questions.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === index ? 'bg-sky-400 scale-125 border-2 border-white' : i < index ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          ))}
        </div>,
        document.getElementById('portal-progress-dots')!
      )}

      <div className="flex flex-col items-center animate-fade-in text-center w-full max-w-2xl pt-4">
        <p className="text-slate-400 text-lg mb-10 italic font-bold tracking-wide">Task {index + 1} of {questions.length}</p>

        <div className={`bg-slate-800 p-12 rounded-[40px] border-4 transition-all duration-300 mb-10 w-full shadow-2xl flex flex-col items-center min-h-[450px] justify-center ${feedback === 'incorrect' ? 'border-red-500 animate-shake' : feedback === 'correct' ? 'border-emerald-500 scale-105' : 'border-slate-700'}`}>
            
            {currentQ.type === 'multi' ? (
                <div className="w-full space-y-8 animate-fade-in">
                    <h2 className="text-3xl font-bold text-white mb-6">"{currentQ.instruction}"</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* FIX: Assert options as object array type for multi-select questions to resolve property access error on 'opt.label'. */}
                        {(currentQ.options as { label: string; isCorrect: boolean }[]).map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleMultiSelect(i)}
                                className={`p-6 rounded-2xl border-4 font-black text-xl italic transition-all ${selectedIndices.includes(i) ? 'bg-sky-500 border-sky-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-sky-500'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleMultiSubmit}
                        disabled={selectedIndices.length !== 2 || !!feedback}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-12 rounded-full text-2xl uppercase italic transition-all disabled:opacity-30 border-b-8 border-emerald-800"
                    >
                        Submit
                    </button>
                    {feedback === 'correct' && <p className="text-emerald-400 font-bold italic animate-fade-in">{currentQ.correctFeedback}</p>}
                    {feedback === 'incorrect' && <p className="text-red-400 font-bold italic animate-fade-in">{currentQ.hint}</p>}
                </div>
            ) : (
                <>
                    <div className="text-center mb-10">
                        <p className="text-slate-500 font-bold text-xs tracking-wide mb-2">The Pattern</p>
                        <p className="text-4xl font-black text-white leading-tight italic">"{currentQ.label}"</p>
                    </div>

                    {stage === 1 ? (
                    <div className="w-full space-y-6 animate-fade-in">
                        <h3 className="text-3xl font-bold text-center text-white mb-4">Linear or Not?</h3>
                        <div className="flex gap-4 w-full">
                        <button 
                            onClick={() => handleLinearChoice(true)} 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 p-6 rounded-2xl text-white font-black text-2xl shadow-xl italic transition-all active:scale-95 border-b-8 border-emerald-800 active:border-b-0 active:translate-y-2"
                        >
                            Linear
                        </button>
                        <button 
                            onClick={() => handleLinearChoice(false)} 
                            className="flex-1 bg-purple-600 hover:bg-purple-500 p-6 rounded-2xl text-white font-black text-2xl shadow-xl italic transition-all active:scale-95 border-b-8 border-purple-800 active:border-b-0 active:translate-y-2"
                        >
                            Non-linear
                        </button>
                        </div>
                        {feedback === 'incorrect' && (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mt-4 animate-fade-in">
                            <p className="text-red-400 font-bold text-center italic">Linear means when a pattern that changes by the same amount each step.</p>
                        </div>
                        )}
                    </div>
                    ) : (
                    <div className="w-full animate-fade-in space-y-6">
                        <div className="bg-emerald-500/20 py-2 px-4 rounded-full text-emerald-400 font-black text-center text-sm tracking-wide mb-4">
                        Correct! It's {currentQ.isLinear ? 'Linear' : 'Non-linear'}
                        </div>
                        <h3 className="text-2xl font-bold text-center text-slate-200 italic">How do you know?</h3>
                        <div className="relative">
                        <select 
                            onChange={handleExplanationChange} 
                            value=""
                            className="w-full p-6 bg-slate-900 border-4 border-sky-500 rounded-3xl text-white text-xl font-bold italic focus:outline-none appearance-none cursor-pointer"
                        >
                            <option value="" disabled>Choose an explanation...</option>
                            {/* FIX: Assert currentQ.options as string array for 'standard' question types to fix property access errors during rendering. */}
                            {(currentQ.options as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-sky-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                        </div>
                        {feedback === 'incorrect' && (
                        <p className="text-red-400 font-bold text-center animate-pulse">Try again! Look closely at the pattern steps.</p>
                        )}
                    </div>
                    )}
                </>
            )}
        </div>
      </div>

      <LevelCompleteModal
        isOpen={showModal}
        stars={earnedStars}
        onNext={() => onNext ? onNext() : onExit?.()}
        onReplay={() => {
          setIndex(0);
          setStage(1);
          setErrors(0);
          setShowModal(false);
          setFeedback(null);
          setSelectedIndices([]);
        }}
        isFinalLevel={isFinalLevelInLesson}
      />
    </div>
  );
};

export default PatternLevel7;
