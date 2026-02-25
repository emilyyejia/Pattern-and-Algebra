
import React from 'react';

interface LevelCompleteModalProps {
  isOpen: boolean;
  stars: number;
  onReplay: () => void;
  onNext: () => void;
  isFinalLevel?: boolean;
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    className={`w-14 h-14 mx-1 ${filled ? 'text-[#FACC15]' : 'text-slate-700'}`}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? "0" : "2"}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
  </svg>
);

const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({ isOpen, stars, onReplay, onNext, isFinalLevel = false }) => {
  if (!isOpen) return null;

  const heading = stars === 1 ? "Good Effort!" : "Level Complete!";
  
  const getMessage = () => {
    if (stars === 1) {
      return (
        <>
          <p className="mb-3">You need 2 stars to unlock the next level.</p>
          <p>Answer correctly on the first try to earn more stars!</p>
        </>
      );
    } else if (stars === 2) {
      return "Answer correctly on the first try to earn more stars!";
    }
    return null; // 3 stars - no message
  };

  const getNextButtonLabel = () => {
    return isFinalLevel ? "Back to Map" : "Next Level";
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-center items-center z-[300] p-4 animate-fade-in">
      <div className="bg-[#1E293B] p-10 md:p-12 rounded-[40px] shadow-2xl text-center max-w-md w-full border border-slate-700">
        
        {/* Heading */}
        <h2 className="text-4xl font-black mb-6 tracking-tight italic uppercase text-[#FACC15]">
          {heading}
        </h2>

        {/* Stars */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3].map(i => <StarIcon key={i} filled={i <= stars} />)}
        </div>

        {/* Instruction Text */}
        {getMessage() && (
          <div className="text-slate-300 font-bold mb-10 text-lg leading-relaxed px-4">
            {getMessage()}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          {/* Show Next Level button for 2 or 3 stars */}
          {stars >= 2 && (
            <button
              onClick={onNext}
              className="w-full bg-[#10B981] hover:bg-emerald-400 text-white font-black py-5 rounded-2xl shadow-lg transition-all text-2xl uppercase tracking-tighter italic"
            >
              {getNextButtonLabel()}
            </button>
          )}
          
          {/* Show Replay button only for 1 or 2 stars (not for 3 stars) */}
          {stars < 3 && (
            <button
              onClick={onReplay}
              className="w-full bg-[#3B82F6] hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-lg transition-all text-2xl uppercase tracking-tighter italic"
            >
              Replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelCompleteModal;
