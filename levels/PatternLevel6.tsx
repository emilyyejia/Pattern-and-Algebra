
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import { playTone } from '../services/audioService';

type Phase = 'intro' | 'practice' | 'assess';

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-10 h-10" }) => (
  <svg className={`${className} ${filled ? 'text-yellow-400' : 'text-gray-400'}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? "0" : "1.5"} viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
  </svg>
);

const PhaseAssess: React.FC<{ onComplete: (stars: number) => void }> = ({ onComplete }) => {
    const [index, setIndex] = useState(0);
    const [errors, setErrors] = useState(0);
    const questions = [
        { rule: "Start at 1, add 2", options: ["1, 3, 5, 7", "1, 2, 3, 4", "1, 4, 7, 10"], correct: 0 },
        { rule: "Start at 20, subtract 4", options: ["20, 15, 10, 5", "20, 16, 12, 8", "20, 24, 28, 32"], correct: 1 },
        { rule: "Start at 2, double it", options: ["2, 4, 6, 8", "2, 5, 10, 15", "2, 4, 8, 16"], correct: 2 }
    ];

    const handle = (optIdx: number) => {
        if (optIdx === questions[index].correct) {
            playTone(600, 0.1, 'sine');
            if (index < questions.length - 1) setIndex(i => i + 1);
            else onComplete(errors === 0 ? 3 : errors <= 2 ? 2 : 1);
        } else {
            setErrors(e => e + 1);
            playTone(200, 0.2, 'sawtooth');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <h2 className="text-3xl font-bold text-sky-400 mb-8">Match the Rule to the Sequence</h2>
            <div className="bg-slate-800 p-8 rounded-2xl border-2 border-slate-600 mb-8 w-full max-w-lg">
                <p className="text-2xl font-bold text-yellow-400 mb-6">"{questions[index].rule}"</p>
                <div className="flex flex-col gap-4">
                    {questions[index].options.map((opt, i) => (
                        <button key={i} onClick={() => handle(i)} className="bg-slate-700 hover:bg-slate-600 p-4 rounded-xl font-mono text-xl">{opt}</button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PatternLevel6: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [phase, setPhase] = useState<Phase>(() => partialProgress?.phase || 'intro');
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const isCompletedRef = useRef(false);
  const [instrOpen, setInstrOpen] = useState(false);

  useEffect(() => {
    return () => { if (!isCompletedRef.current && onSavePartialProgress) onSavePartialProgress({ phase }); };
  }, [onSavePartialProgress, phase]);

  const handleLevelComplete = (stars: number) => {
    isCompletedRef.current = true; setEarnedStars(stars); setShowModal(true); onComplete(stars);
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 right-4 flex gap-2">
        {['intro', 'practice', 'assess'].map((p, i) => {
            const cur = phase === 'intro' ? 0 : phase === 'practice' ? 1 : 2;
            let bg = 'bg-slate-700'; if (i < cur) bg = 'bg-emerald-500'; if (i === cur) bg = 'bg-sky-500 border-2 border-white';
            return <div key={p} className={`w-3 h-3 rounded-full ${bg}`} />;
        })}
      </div>
      <InstructionButton onClick={() => setInstrOpen(true)} />
      <InstructionModal isOpen={instrOpen} onClose={() => setInstrOpen(false)} title="Translation Master">
        <p>Learn how to turn a written rule into a list of numbers.</p>
      </InstructionModal>

      {phase === 'intro' && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <h2 className="text-4xl font-bold text-sky-400 mb-6">Introduction: Sequence Translation</h2>
              <p className="text-xl max-w-xl text-slate-300 mb-8">Rules are like instructions for your numbers. If you follow them correctly, you'll build the right sequence every time!</p>
              <button onClick={() => setPhase('practice')} className="bg-sky-500 px-12 py-3 rounded-full font-bold">Start Practice</button>
          </div>
      )}
      {phase === 'practice' && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <h2 className="text-3xl font-bold mb-8">Follow the Rule</h2>
              <p className="text-xl mb-4">Start at 100, Subtract 10.</p>
              <div className="flex gap-4">
                  <button onClick={() => setPhase('assess')} className="bg-emerald-600 p-6 rounded-xl font-bold text-2xl">100, 90, 80...</button>
                  <button onClick={() => playTone(200, 0.2, 'sawtooth')} className="bg-slate-700 p-6 rounded-xl font-bold text-2xl">100, 110, 120...</button>
              </div>
          </div>
      )}
      {phase === 'assess' && <PhaseAssess onComplete={handleLevelComplete} />}

      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex flex-col justify-center items-center z-[200] p-4">
           <div className="bg-white p-12 rounded-3xl text-center max-w-md w-full text-slate-800">
             <h2 className="text-4xl font-black mb-4">{earnedStars === 1 ? "Good effort!" : "Challenge complete!"}</h2>
             <div className="flex justify-center my-8">
               {[1, 2, 3].map(i => <StarIcon key={i} filled={i <= earnedStars} className="w-16 h-16 mx-2" />)}
             </div>
             {earnedStars === 1 && <p className="text-lg font-bold text-slate-600 mb-2">Get 2 stars to unlock the next level</p>}
             {earnedStars < 3 && <p className="text-sm text-slate-400 italic mb-8">Solve with fewer errors to get more stars!</p>}
             <div className="flex gap-4">
                <button onClick={() => { setPhase('intro'); setShowModal(false); isCompletedRef.current = false; }} className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl">Replay</button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
};
export default PatternLevel6;
