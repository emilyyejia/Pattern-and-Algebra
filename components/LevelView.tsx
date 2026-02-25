
import React, { useRef, useEffect } from 'react';
import type { Level, PlayerProgress } from '../types';
import { useToolbar } from '../hooks/useToolbarState';
import Toolbar from './toolbar/Toolbar';
import HelpModal from './toolbar/HelpModal';
import TextToSpeech from './toolbar/TextToSpeech';
import LineReader from './toolbar/LineReader';
import Notes from './toolbar/Notes';
import Calculator from './toolbar/Calculator';
import DocumentsModal from './toolbar/DocumentsModal';
import Highlighter from './toolbar/Highlighter';

interface LevelViewProps {
  level: Level;
  onBackToMap: () => void;
  onComplete: (stars: number) => void;
  onExit: () => void;
  onNext?: () => void;
  partialProgress?: any;
  onSavePartialProgress?: (state: any | null) => void;
  progress?: PlayerProgress;
  lessonTitle?: string | null;
  isFinalLevelInLesson?: boolean;
}

const LevelView: React.FC<LevelViewProps> = ({ level, onBackToMap, onComplete, onExit, onNext, partialProgress, onSavePartialProgress, progress, lessonTitle, isFinalLevelInLesson = false }) => {
  const LevelComponent = level.component;
  const { 
    activeTool, 
    zoomLevel, 
    isHighContrast, 
    lineReaderPosition, 
    showLineReader
  } = useToolbar();
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`fixed inset-0 bg-[#080E1A] p-4 flex flex-col animate-fade-in overflow-hidden ${isHighContrast ? 'high-contrast' : ''}`}>
      {/* Header Area */}
      <div className="relative z-[101] flex-shrink-0 flex items-center justify-between px-4 h-16">
        <button
          onClick={onBackToMap}
          className="bg-[#334155] hover:bg-[#475569] text-white font-bold py-2 px-4 rounded-lg transition-all shadow-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Map
        </button>

        {/* This spacing is reserved for Level Components to inject progress dots via absolute positioning */}
        <div id="portal-progress-dots" className="flex-grow" />

        {lessonTitle ? (
            <h1 className="text-sm md:text-base font-black text-sky-400 uppercase tracking-tighter text-right">
                {lessonTitle}: {level.name}
            </h1>
        ) : <div />}
      </div>

      <div className="flex-grow relative flex overflow-hidden">
        {/* Left Sidebar Tab for Instructions */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-[110]">
             <div id="instruction-trigger-portal" className="flex flex-col">
                {/* Levels will inject their instruction buttons here */}
             </div>
        </div>

        <div id="level-content-container" ref={contentWrapperRef} className="flex-grow relative overflow-auto pt-4">
          <Highlighter contentRef={contentWrapperRef} />
          <div 
            className="transition-transform duration-200 h-full w-full" 
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
          >
            <LevelComponent
              topic={level.topic}
              onComplete={onComplete}
              onExit={onExit}
              onNext={onNext}
              questions={level.questions}
              partialProgress={partialProgress}
              onSavePartialProgress={onSavePartialProgress}
              progress={progress}
              levelId={level.id}
              isFinalLevelInLesson={isFinalLevelInLesson}
            />
          </div>
        </div>
      </div>

      <Toolbar />
      {activeTool === 'help' && <HelpModal />}
      {activeTool === 'listen' && <TextToSpeech contentRef={contentWrapperRef} />}
      {showLineReader && <LineReader initialPosition={lineReaderPosition} />}
      {activeTool === 'notes' && <Notes />}
      {activeTool === 'calculator' && <Calculator />}
      {activeTool === 'documents' && <DocumentsModal />}
    </div>
  );
};

export default LevelView;
