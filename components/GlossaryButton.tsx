
import React from 'react';

interface GlossaryButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const GlossaryButton: React.FC<GlossaryButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-[#1E293B] border-y border-r border-sky-500/30 text-sky-400 p-4 rounded-r-2xl shadow-xl hover:bg-slate-800 transition-all hover:pl-6 group disabled:opacity-30 disabled:pointer-events-none"
      title="Open Glossary"
    >
      <svg className="w-10 h-10 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </button>
  );
};

export default GlossaryButton;
