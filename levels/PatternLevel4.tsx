
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import { playTone } from '../services/audioService';

type Phase = 'intro' | 'practice' | 'assess';

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-10 h-10 md:w-12 md:h-12 mx-1" }) => (
  <svg
    className={`${className} ${filled ? 'text-yellow-400' : 'text-gray-400'}`}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? "0" : "1.5"}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
  </svg>
);

// --- GAME 1: STAIR MASTER (INTRO) ---
const PhaseIntro: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [mode, setMode] = useState<'stairs' | 'rollercoaster'>('stairs');
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-5xl mx-auto p-4 text-center animate-fade-in">
      <h1 className="text-3xl font-bold text-sky-300 mb-6">Game 1: Stairs vs. Rollercoaster 🎢</h1>
      <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Compare <strong>Linear</strong> vs. <strong>Non-Linear</strong> growth.</p>
      <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => setMode('stairs')} className={`px-6 py-3 rounded-lg font-bold transition-all ${mode === 'stairs' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-700 text-gray-300'}`}>Stairs (Linear)</button>
          <button onClick={() => setMode('rollercoaster')} className={`px-6 py-3 rounded-lg font-bold transition-all ${mode === 'rollercoaster' ? 'bg-purple-500 text-white shadow-lg' : 'bg-gray-700 text-gray-300'}`}>Coaster (Non-Linear)</button>
      </div>
      <div className="relative w-full max-w-3xl h-64 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden mb-8 flex items-end px-10 pb-10">
          <div className="flex items-end gap-2 w-full h-full relative z-10">
            {mode === 'stairs' ? [1, 2, 3, 4, 5, 6].map((h, i) => <div key={i} className="flex-1 bg-emerald-500 rounded-t-sm" style={{ height: `${h * 15}%` }}></div>)
                              : [1, 2, 4, 7, 11, 16].map((h, i) => <div key={i} className="flex-1 bg-purple-500 rounded-t-sm" style={{ height: `${Math.min(h * 6, 100)}%` }}></div>)}
          </div>
      </div>
      <button onClick={onNext} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-10 rounded-full text-xl shadow-lg">Next Game</button>
    </div>
  );
};

// --- GAME 2: DIFFERENCE DETECTIVE (PRACTICE) ---
const PhasePractice: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const problems = [{ nums: [5, 10, 15, 20], type: 'Linear' }, { nums: [2, 4, 8, 16], type: 'Non-Linear' }, { nums: [100, 90, 80, 70], type: 'Linear' }];

  const handleChoice = (type: string) => {
      if (feedback !== 'none') return;
      if (type === problems[index].type) {
          setFeedback('correct'); playTone(600, 0.1, 'sine');
          setTimeout(() => { if (index < problems.length - 1) { setIndex(i => i + 1); setFeedback('none'); } else onComplete(); }, 1500);
      } else { setFeedback('incorrect'); playTone(200, 0.2, 'sawtooth'); setTimeout(() => setFeedback('none'), 1500); }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-sky-300 mb-4">Game 2: Difference Detective 🕵️‍♂️</h2>
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 shadow-2xl w-full mb-8 flex flex-col items-center">
          <div className="flex gap-4 mb-12">
              {problems[index].nums.map((n, i) => <div key={i} className="text-3xl font-bold bg-gray-800 w-16 h-16 flex items-center justify-center rounded-lg border border-gray-600">{n}</div>)}
          </div>
      </div>
      <div className="flex gap-6 w-full max-w-lg">
        <button onClick={() => handleChoice('Linear')} className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-105">LINEAR (Same)</button>
        <button onClick={() => handleChoice('Non-Linear')} className="flex-1 bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-105">NON-LINEAR (Diff)</button>
      </div>
    </div>
  );
};

// --- GAME 3: GRAPH MATCHER (ASSESS) ---
const PhaseAssess: React.FC<{ onComplete: (stars: number) => void }> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const questions = [
      { scenario: "You earn $15 per hour.", correct: 'linear' },
      { scenario: "Bacteria doubles every 20 mins.", correct: 'nonlinear' },
      { scenario: "Adding 5 stickers to a book daily.", correct: 'linear' }
  ];

  const handleChoice = (id: string) => {
    if (answered) return; setAnswered(true);
    const isCorrect = id === questions[index].correct;
    if (isCorrect) { setScore(s => s + 1); playTone(800, 0.1, 'sine'); } else playTone(300, 0.2, 'sawtooth');
    setTimeout(() => {
      if (index < questions.length - 1) { setIndex(i => i + 1); setAnswered(false); }
      else { const final = score + (isCorrect ? 1 : 0); onComplete(final >= 3 ? 3 : final >= 2 ? 2 : 1); }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 w-full max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-sky-300 mb-8">Game 3: Graph Matcher 📉</h2>
      <div className="bg-white text-slate-900 p-8 rounded-xl shadow-xl w-full mb-10 transform border-4 border-slate-200"><h3 className="text-2xl font-serif italic">"{questions[index].scenario}"</h3></div>
      <div className="grid grid-cols-2 gap-6 w-full">
        <button onClick={() => handleChoice('linear')} className="bg-gray-800 border-4 border-emerald-500/50 p-4 rounded-xl flex flex-col items-center gap-2"><div className="w-full h-12 border-b-2 border-l-2 border-gray-500 relative"><div className="absolute bottom-0 left-0 w-full h-full border-t-2 border-emerald-400 -rotate-45 origin-bottom-left"></div></div><span className="text-white font-bold">Straight Line</span></button>
        <button onClick={() => handleChoice('nonlinear')} className="bg-gray-800 border-4 border-purple-500/50 p-4 rounded-xl flex flex-col items-center gap-2"><div className="w-full h-12 border-b-2 border-l-2 border-gray-500 flex items-end"><svg viewBox="0 0 100 100" className="w-full h-full"><path d="M0,100 Q50,90 100,0" fill="none" stroke="#a855f7" strokeWidth="6" /></svg></div><span className="text-white font-bold">Curved Line</span></button>
      </div>
    </div>
  );
};

const PatternLevel4: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [phase, setPhase] = useState<Phase>(() => partialProgress?.phase || 'intro');
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const isCompletedRef = useRef(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  useEffect(() => {
    return () => { if (!isCompletedRef.current && onSavePartialProgress) onSavePartialProgress({ phase }); };
  }, [onSavePartialProgress, phase]);

  const handleLevelComplete = (stars: number) => {
    isCompletedRef.current = true; setEarnedStars(stars); setShowCompletionModal(true); onComplete(stars);
  };
  const handleReplay = () => {
    setPhase('intro'); setShowCompletionModal(false); setEarnedStars(0); isCompletedRef.current = false; onSavePartialProgress?.(null);
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-16 right-4 flex gap-2 z-10">
        {['intro', 'practice', 'assess'].map((p, i) => {
            const currentIdx = phase === 'intro' ? 0 : phase === 'practice' ? 1 : 2;
            let bg = 'bg-gray-600'; if (i < currentIdx) bg = 'bg-emerald-500'; if (i === currentIdx) bg = 'bg-sky-500 border-2 border-white';
            return <div key={p} className={`w-3 h-3 rounded-full transition-all ${bg}`} />;
        })}
      </div>
      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} title="Linear vs. Non-Linear">
        <p><strong>Game 1:</strong> Compare Stairs (Linear) and Rollercoasters (Non-Linear).</p>
        <p><strong>Game 2:</strong> Check the differences. Constant = Linear.</p>
        <p><strong>Game 3:</strong> Match the real-life story to the graph shape.</p>
      </InstructionModal>

      {phase === 'intro' && <PhaseIntro onNext={() => setPhase('practice')} />}
      {phase === 'practice' && <PhasePractice onComplete={() => setPhase('assess')} />}
      {phase === 'assess' && <PhaseAssess onComplete={handleLevelComplete} />}

      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/80 flex flex-col justify-center items-center z-[200] p-4 animate-fade-in">
           <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-md w-full">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{earnedStars === 1 ? "Good effort!" : "Challenge complete!"}</h2>
             <div className="flex justify-center my-6">
               {[1, 2, 3].map(i => <StarIcon key={i} filled={i <= earnedStars} />)}
             </div>
             {earnedStars === 1 && <p className="text-base text-slate-700 font-semibold mb-2">Get 2 stars to unlock the next level</p>}
             {earnedStars < 3 && <p className="text-sm text-gray-500 italic mb-6">Match the stories to graphs correctly on the first try to get more stars!</p>}
             <div className="flex gap-4">
                <button onClick={handleReplay} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md transition-all">Replay</button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
};
export default PatternLevel4;
