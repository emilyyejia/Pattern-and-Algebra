
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import LevelCompleteModal from '../components/LevelCompleteModal';

type Phase = 'intro' | 'practice' | 'assess';

const PhaseAssess: React.FC<{ onComplete: (stars: number) => void }> = ({ onComplete }) => {
    const [index, setIndex] = useState(0);
    const [errors, setErrors] = useState(0);
    const [val, setVal] = useState('');
    const [showHint, setShowHint] = useState(false);

    const questions = [
        { 
            q: "A candle starts at 20cm. It burns 3cm every hour. How tall after 4 hours?", 
            ans: 8,
            hint: "The candle gets shorter each hour. How much shorter after 4 hours?"
        },
        { 
            q: "You start with $20. You save $5 every day. How much will you have in 10 days?", 
            ans: 70,
            hint: "Not quite! Remember, you add the same $5 each day. Try counting up from $20 in steps of 5."
        },
        { 
            q: "A water tank loses 3 litres of water every hour. It starts with 20 litres. How much water is left after 5 hours?", 
            ans: 5,
            hint: "Almost! Start from 20 litres and think about how much water is gone after losing the same amount each hour."
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
            <div className={`bg-slate-800 p-10 rounded-2xl border-2 mb-8 w-full shadow-2xl transition-colors duration-300 ${showHint ? 'border-red-500' : 'border-slate-600'}`}>
                <p className="text-2xl text-white mb-6 leading-relaxed italic font-bold">"{questions[index].q}"</p>
                
                {showHint && (
                    <div className="mb-6 p-4 bg-red-500/10 rounded-xl animate-fade-in border border-red-500/20">
                        <p className="text-red-400 font-bold italic">{questions[index].hint}</p>
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

const PatternLevel8: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress, isFinalLevelInLesson = false }) => {
  const [phase, setPhase] = useState<Phase>(() => partialProgress?.phase || 'intro');
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [showPracticeHint, setShowPracticeHint] = useState(false);
  const isCompletedRef = useRef(false);

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
      {phase === 'intro' && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-3xl max-w-xl text-white mb-8 font-bold">Use the pattern to predict what comes next!</p>
              <button onClick={() => setPhase('practice')} className="bg-sky-500 px-12 py-3 rounded-full font-black uppercase italic shadow-lg hover:scale-105 transition-all">Start</button>
          </div>
      )}
      {phase === 'practice' && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center w-full max-w-3xl">
              <div className={`bg-slate-800 p-10 rounded-3xl border-2 mb-8 w-full shadow-2xl transition-colors duration-300 ${showPracticeHint ? 'border-red-500' : 'border-slate-600'}`}>
                <p className="text-2xl text-white mb-6 leading-relaxed font-bold">"Start at 10. Add 5 every step. What is Term 10?"</p>
                
                {showPracticeHint && (
                    <div className="mb-8 p-6 bg-red-500/10 rounded-xl animate-fade-in border border-red-500/20">
                        <p className="text-red-400 font-bold italic text-lg leading-relaxed">Term 1 is 10. The pattern increases by 5 each time. What is term 10?</p>
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
        onNext={() => onExit?.()}
        onReplay={() => {
          setPhase('intro');
          setShowModal(false);
          setShowPracticeHint(false);
          isCompletedRef.current = false;
        }}
        isFinalLevel={isFinalLevelInLesson}
      />
    </div>
  );
};
export default PatternLevel8;
