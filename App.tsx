
import React, { useState, useMemo } from 'react';
import type { Level, PlayerProgress, Lesson, LevelStatus as LevelStatusType } from './types';
import { LevelStatus } from './types';
import { usePlayerProgress } from './hooks/usePlayerProgress';
import { ToolbarProvider } from './hooks/useToolbarState';

import LevelView from './components/LevelView';
import PatternLevel1 from './levels/PatternLevel1';
import PatternLevel2 from './levels/PatternLevel2';
import PatternLevel3 from './levels/PatternLevel3';
import PatternLevel5 from './levels/PatternLevel5';
import PatternLevel7 from './levels/PatternLevel7';
import PatternLevel8 from './levels/PatternLevel8';
import PatternLevelMastery from './levels/PatternLevelMastery';

const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill={filled ? "#FACC15" : "none"} 
        stroke={filled ? "#FACC15" : "#475569"} 
        strokeWidth={filled ? 0 : 2}
        className={className}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0v3z" />
    </svg>
);

const LESSON_DEFINITIONS: Lesson[] = [
    {
        title: "Identifying Patterns",
        levels: [
            { id: 'p1', name: 'Level 1', description: 'Terms and Values', component: PatternLevel1, topic: 'Terminology' },
            { id: 'p2', name: 'Level 2', description: 'Sort it Out', component: PatternLevel2, topic: 'Identification' },
            { id: 'p_mastery', name: 'Level 3', description: 'Pattern Mastery', component: PatternLevelMastery, topic: 'Mastery' },
        ]
    },
    {
        title: "Describing Pattern Rules",
        levels: [
            { id: 'p3', name: 'Level 1', description: 'Rule Detective', component: PatternLevel3, topic: 'Pattern Rules' },
            { id: 'p4', name: 'Level 2', description: 'Value Architect', component: PatternLevel5, topic: 'Finding Missing Values' },
        ]
    },
    {
        title: "Linear Patterns",
        levels: [
            { id: 'p5', name: 'Level 1', description: 'Introduction: What is a Linear Pattern?', component: PatternLevel7, topic: 'Linear vs Non-Linear' },
            { id: 'p6', name: 'Level 2', description: 'Constant Growth', component: PatternLevel8, topic: 'Linear Application' },
        ]
    }
];

const AVATAR_UNLOCK_THRESHOLD = 12;

const getLevelStatus = (levelId: string, lessons: Lesson[], progress: PlayerProgress): LevelStatusType => {
    const flatLevels = lessons.flatMap(l => l.levels);
    const index = flatLevels.findIndex(l => l.id === levelId);
    if ((progress[levelId] || 0) >= 2) return LevelStatus.COMPLETED;
    if (index === 0) return LevelStatus.UNLOCKED;
    const prevLevelId = flatLevels[index - 1].id;
    if ((progress[prevLevelId] || 0) >= 2) return LevelStatus.UNLOCKED;
    return LevelStatus.LOCKED;
};

const LevelNode: React.FC<{ 
    level: Level; 
    status: LevelStatusType; 
    stars: number; 
    onSelect: (id: string) => void;
}> = ({ level, status, stars, onSelect }) => {
    const isLocked = status === LevelStatus.LOCKED;
    const isCompleted = status === LevelStatus.COMPLETED;
    
    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={() => !isLocked && onSelect(level.id)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-[4px] transition-all duration-300
                    ${isLocked 
                        ? 'bg-[#1a2333] border-[#2d3a4f] cursor-default shadow-none' 
                        : isCompleted 
                            ? 'bg-emerald-500 border-emerald-400/40 hover:scale-110 shadow-lg' 
                            : 'bg-sky-500 border-sky-400/40 hover:scale-110 shadow-lg shadow-sky-500/20'}
                `}
            >
                {isLocked ? (
                    <LockIcon className="w-6 h-6 text-[#94a3b8]" />
                ) : isCompleted ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </button>
            
            <div className="flex flex-col items-center">
                <span className={`text-[10px] md:text-xs font-black mb-1 tracking-tight transition-colors ${isLocked ? 'text-slate-500' : 'text-slate-400'}`}>{level.name}</span>
                <div className="flex gap-0.5">
                    {[1, 2, 3].map(i => (
                        <StarIcon key={i} filled={i <= stars} className="w-3 h-3 md:w-4 md:h-4" />
                    ))}
                </div>
            </div>
        </div>
    );
};

function App() {
    const { progress, partialProgress, savePartialProgress, completeLevel } = usePlayerProgress(LESSON_DEFINITIONS);
    const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);

    const totalStars = useMemo(() => Object.values(progress).reduce((a, b) => a + b, 0), [progress]);
    const flatLevels = useMemo(() => LESSON_DEFINITIONS.flatMap(l => l.levels), []);
    const currentLevel = flatLevels.find(l => l.id === currentLevelId);
    
    const isFinalLevelInLesson = useMemo(() => {
        if (!currentLevelId) return false;
        const currentIndex = flatLevels.findIndex(l => l.id === currentLevelId);
        // It's the final level only if it's the last level across all lessons
        return currentIndex === flatLevels.length - 1;
    }, [currentLevelId, flatLevels]);

    const handleNextLevel = () => {
        const currentIndex = flatLevels.findIndex(l => l.id === currentLevelId);
        if (currentIndex !== -1 && currentIndex < flatLevels.length - 1) {
            setCurrentLevelId(flatLevels[currentIndex + 1].id);
        } else {
            setCurrentLevelId(null);
        }
    };

    return (
        <ToolbarProvider>
            <div className="min-h-screen bg-[#080E1A] text-white font-sans selection:bg-sky-500/30 overflow-x-hidden antialiased">
                {currentLevel ? (
                    <LevelView
                        level={currentLevel}
                        onBackToMap={() => setCurrentLevelId(null)}
                        onComplete={(stars) => completeLevel(currentLevelId!, stars)}
                        onExit={() => setCurrentLevelId(null)}
                        onNext={handleNextLevel}
                        partialProgress={partialProgress[currentLevel.id]}
                        onSavePartialProgress={(state) => savePartialProgress(currentLevel.id, state)}
                        progress={progress}
                        lessonTitle={LESSON_DEFINITIONS.find(l => l.levels.some(lev => lev.id === currentLevelId))?.title}
                        isFinalLevelInLesson={isFinalLevelInLesson}
                    />
                ) : (
                    <div className="relative min-h-screen flex flex-col items-center py-12 px-6 overflow-y-auto">
                        
                        {/* 1. Stars Counter */}
                        <div className="fixed top-8 left-8 bg-[#111827] border-2 border-[#FACC15]/80 rounded-2xl p-4 shadow-2xl z-50 flex flex-col items-center min-w-[140px]">
                            <div className="flex items-center gap-2 mb-1">
                                <StarIcon filled={true} className="w-8 h-8" />
                                <span className="text-4xl font-black text-white leading-none">{totalStars}</span>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 font-bold tracking-wide mt-1">
                                Earn {AVATAR_UNLOCK_THRESHOLD} stars for an avatar.
                            </p>
                        </div>

                        {/* 2. Title & Goal */}
                        <div className="text-center mb-24 mt-4 w-full">
                            <h1 className="text-6xl md:text-7xl font-black text-sky-500 mb-4 tracking-tighter leading-none italic">
                                Pattern & Algebra
                            </h1>
                            <p className="text-xl md:text-2xl font-bold text-slate-400 italic">
                                Goal: <span className="text-slate-300 font-medium">I can identify, describe and extend all types of patterns.</span>
                            </p>
                        </div>

                        {/* 3. Path Map */}
                        <div className="relative flex flex-wrap lg:flex-nowrap justify-center items-center gap-0 max-w-full pb-32">
                            {LESSON_DEFINITIONS.map((lesson, lessonIdx) => (
                                <React.Fragment key={lessonIdx}>
                                    <div className="flex flex-col items-center group">
                                        <div className="bg-[#111827] rounded-[40px] p-10 border border-slate-800 shadow-2xl flex flex-col items-center min-w-[340px]">
                                            <h3 className="text-2xl font-black text-sky-400 tracking-tight mb-10 text-center italic">{lesson.title}</h3>
                                            <div className="flex gap-8">
                                                {lesson.levels.map((level) => (
                                                    <LevelNode 
                                                        key={level.id}
                                                        level={level}
                                                        status={getLevelStatus(level.id, LESSON_DEFINITIONS, progress)}
                                                        stars={progress[level.id] || 0}
                                                        onSelect={setCurrentLevelId}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Dashed Connection */}
                                    {lessonIdx < LESSON_DEFINITIONS.length - 1 && (
                                        <div className="flex items-center mx-[-4px]">
                                            <div className="w-16 md:w-24 border-t-[8px] border-dashed border-slate-700 opacity-60" />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolbarProvider>
    );
}

export default App;
