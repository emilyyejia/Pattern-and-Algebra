
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import LevelCompleteModal from '../components/LevelCompleteModal';

type Phase = 'intro' | 'practice' | 'assess';

const PhaseAssess: React.FC<{ onComplete: (stars: number) => void }> = ({ onComplete }) => {
    const [index, setIndex] = useState(0);
    const [errors, setErrors] = useState(0);
    const [val, setVal] = useState('');
    const [showHint, setShowHint] = useState(false);

    const questions = [
        { 
            q: "A candle burns 3cm every hour. It starts at 20cm. How tall after 4 hours?", 
            ans: 8,
            hint: "Subtract 3cm for each hour (3 x 4)."
        },
        { 
            q: "You save $5 a day. You have $20 now. How much in 10 days?", 
            ans: 70,
            hint: "Add $5 for each of the 10 days to your current $20."
        },
        { 
            q: "A water tank loses 3 litres of water every hour. It starts with 20 litres of water. How much water is left after 5 hours?", 
            ans: 5,
            hint: "Water tank starts at 20L. After 1 hour, 17L is left."
        },
    ];

    const check = () => {
        if (parseInt(val) === questions[index].ans) {
            setShowHint(false);
            if (index < questions.length - 1) { 
                setIndex(i => i + 1); 
                setVal(''); 
            }
            else onComplete(errors === 0 ? 3 : errors <= 1 ? 2 : 1);
        } else {
            setErrors(e => e + 1);
            setShowHint(true);
            setVal('');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center animate-fade-in w-full max-w-3xl">
            <h2 className="text-3xl font-black text-sky-400 mb-8 uppercase italic">Growth Word Problems</h2>
            <div className={`bg-slate-800 p-10 rounded-2xl border-2 mb-8 w-full shadow-2xl transition-colors duration-300 ${showHint ? 'border-red-500' : 'border-slate-600'}`}>
                <p className="text-2xl text-white mb-6 leading-relaxed italic font-bold">"{questions[index].q}"</p>
                
                {showHint && (
                    <div className="mb-6 p-4 bg-red-500/10 rounded-xl animate-fade-in border border-red-500/20">
                        <p className="text-red-400 font-bold italic">Hint: {questions[index].hint}</p>
                    </div>
                )}

                <div className="flex flex-col items-center gap-6">
                    <input 
                        type="number" value={val} onChange={e => setVal(e.target.value)}
                        className="bg-slate-900 border-2 border-emerald-500 rounded-lg p-4 text-3xl w-40 text-center text-white italic focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                        placeholder="..." autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && check()}
                    />
                    <button onClick={check} className="bg-emerald-500 px-12 py-4 rounded-full font-black text-xl shadow-lg uppercase italic border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all">Check Answer</button>
                </div>
            </div>
        </div>
    );
};

const PatternLevel8: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [phase, setPhase] = useState<Phase>(() => partialProgress?.phase || 'intro');
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [showPracticeHint, setShowPracticeHint] = useState(false);
  const isCompletedRef = useRef(false);
  const [instrOpen, setInstrOpen] = useState(false);

  useEffect(() => {
    return () => { if (!isCompletedRef.current && onSavePartialProgress) onSavePartialProgress({ phase }); };
  }, [onSavePartialProgress, phase]);

  const handleLevelComplete = (stars: number) => {
    isCompletedRef.current = true; setEarnedStars(stars); setShowModal(true); onComplete(stars);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#080E1A]">
      <div className="absolute top-4 right-4 flex gap-2">
        {['intro', 'practice', 'assess'].map((p, i) => {
            const cur = phase === 'intro' ? 0 : phase === 'practice' ? 1 : 2;
            let bg = 'bg-slate-700'; if (i < cur) bg = 'bg-emerald-500'; if (i === cur) bg = 'bg-sky-500 border-2 border-white';
            return <div key={p} className={`w-3 h-3 rounded-full ${bg}`} />;
        })}
      </div>
      <InstructionButton onClick={() => setInstrOpen(true)} />
      <InstructionModal isOpen={instrOpen} onClose={() => setInstrOpen(false)} title="Growth Master">
        <p>Apply your knowledge of constant (linear) growth to solve real-world patterns.</p>
      </InstructionModal>

      {phase === 'intro' && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <h2 className="text-4xl font-black text-sky-400 mb-6 italic uppercase tracking-tighter">Modeling Growth</h2>
              <p className="text-xl max-w-xl text-slate-300 mb-8 italic">Predict what happens in a linear pattern into the future.</p>
              <button onClick={() => setPhase('practice')} className="bg-sky-500 px-12 py-3 rounded-full font-black uppercase italic shadow-lg hover:scale-105 transition-all">Start</button>
          </div>
      )}
      {phase === 'practice' && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center w-full max-w-3xl">
              <h2 className="text-3xl font-black mb-8 italic uppercase text-sky-400">Practice Task</h2>
              <div className={`bg-slate-800 p-10 rounded-3xl border-2 mb-8 w-full shadow-2xl transition-colors duration-300 ${showPracticeHint ? 'border-red-500' : 'border-slate-600'}`}>
                <p className="text-2xl text-white mb-6 italic font-bold leading-relaxed">"Start at 10. Add 5 every step. What is Term 10?"</p>
                
                {showPracticeHint && (
                    <div className="mb-8 p-6 bg-red-500/10 rounded-xl animate-fade-in border border-red-500/20">
                        <p className="text-red-400 font-bold italic text-lg leading-relaxed">Hint: Term 1 is 10. You add 5 for each step. Term 10 is 9 steps after Term 1 (10 + 9 × 5).</p>
                    </div>
                )}

                <div className="flex gap-6 justify-center">
                    <button onClick={() => setPhase('assess')} className="flex-1 max-w-[200px] bg-emerald-600 hover:bg-emerald-500 p-8 rounded-2xl font-black text-4xl uppercase italic transition-all border-b-8 border-emerald-800 active:border-b-0 active:translate-y-2">55</button>
                    <button onClick={() => setShowPracticeHint(true)} className="flex-1 max-w-[200px] bg-slate-700 hover:bg-slate-600 p-8 rounded-2xl font-black text-4xl uppercase italic transition-all border-b-8 border-slate-800 active:border-b-0 active:translate-y-2">50</button>
                </div>
              </div>
          </div>
      )}
      {phase === 'assess' && <PhaseAssess onComplete={handleLevelComplete} />}

      <LevelCompleteModal
        isOpen={showModal}
        stars={earnedStars}
        nextLabel="Back to Map"
        onNext={() => onExit?.()}
        onReplay={() => {
          setPhase('intro');
          setShowModal(false);
          setShowPracticeHint(false);
          isCompletedRef.current = false;
        }}
      />
    </div>
  );
};
export default PatternLevel8;
