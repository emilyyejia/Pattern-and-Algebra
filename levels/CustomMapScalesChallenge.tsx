
import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import GridMap from '../../components/custom-map-scales/GridMap';
import Key from '../../components/custom-map-scales/Key';
import Equation from '../../components/custom-map-scales/Equation';
import BlockPalette from '../../components/custom-map-scales/BlockPalette';
import LevelIndicator from '../../components/custom-map-scales/LevelIndicator';
import { 
  ALL_LANDMARKS, GRID_ROWS, GRID_COLS, TOTAL_LEVELS, BASE_BLOCK_UNIT_SIZE_PX
} from './custom-map-scales/mapScalesConstants';
import type { Landmark, PlacedBlock, BlockOrientation, LevelData, LevelSolution } from './custom-map-scales/mapScalesTypes';
import type { LevelComponentProps } from '../../types';
import InstructionButton from '../../components/InstructionButton';
import InstructionModal from '../../components/InstructionModal';

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
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
    />
  </svg>
);

const shuffle = <T,>(array: T[]): T[] => array.sort(() => Math.random() - 0.5);

const generateLevelData = (level: number): LevelData => {
  const scale = (level % 2 === 1) ? 100 : 200;
  const selectedLandmarkTemplates = shuffle([...ALL_LANDMARKS]).slice(0, 4);
  const placedLandmarks: Landmark[] = [];
  const occupiedCoords = new Set<string>();

  const orientation: BlockOrientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
  let landmark1: Landmark, landmark2: Landmark;
  let distance: number;
  let line: number;
  let start: number;
  let end: number;

  if (level === 1) {
    distance = 2;
  } else {
    const maxPossibleDistance = (orientation === 'horizontal' ? GRID_COLS : GRID_ROWS) - 1;
    const minDistance = 2;
    distance = Math.floor(Math.random() * (maxPossibleDistance - minDistance + 1)) + minDistance;
  }
  
  if (orientation === 'horizontal') {
    line = Math.floor(Math.random() * (GRID_ROWS - 1)) + 1.5;
    const maxStartColIndex = GRID_COLS - distance;
    const startColIndex = Math.floor(Math.random() * (maxStartColIndex + 1));
    start = startColIndex + 0.5;
    end = start + distance;
    landmark1 = { ...selectedLandmarkTemplates[0], position: { row: line, col: start } };
    landmark2 = { ...selectedLandmarkTemplates[1], position: { row: line, col: end } };
  } else {
    line = Math.floor(Math.random() * (GRID_COLS - 1)) + 1.5;
    const maxStartRowIndex = GRID_ROWS - distance;
    const startRowIndex = Math.floor(Math.random() * (maxStartRowIndex + 1));
    start = startRowIndex + 0.5;
    end = start + distance;
    landmark1 = { ...selectedLandmarkTemplates[0], position: { row: start, col: line } };
    landmark2 = { ...selectedLandmarkTemplates[1], position: { row: end, col: line } };
  }

  occupiedCoords.add(`${Math.round(landmark1.position.col)},${Math.round(landmark1.position.row)}`);
  occupiedCoords.add(`${Math.round(landmark2.position.col)},${Math.round(landmark2.position.row)}`);
  placedLandmarks.push(landmark1, landmark2);

  for (let i = 2; i < 4; i++) {
    let placed = false;
    while (!placed) {
      const randCol = Math.floor(Math.random() * GRID_COLS) + 1;
      const randRow = Math.floor(Math.random() * GRID_ROWS) + 1;
      const coordKey = `${randCol},${randRow}`;
      if (!occupiedCoords.has(coordKey)) {
        const landmark = { ...selectedLandmarkTemplates[i], position: { row: randRow, col: randCol } };
        placedLandmarks.push(landmark);
        occupiedCoords.add(coordKey);
        placed = true;
      }
    }
  }

  const questionLandmarks = shuffle([landmark1, landmark2]);
  const solution: LevelSolution = {
    landmark1: questionLandmarks[0],
    landmark2: questionLandmarks[1],
    distance,
    orientation,
    line,
    start,
    end,
  };

  return { level, landmarks: placedLandmarks, scale, solution };
};

const isTouchDevice = () => 'ontouchstart' in window;
const backendForDND = isTouchDevice() ? TouchBackend : HTML5Backend;

const CustomMapScalesChallenge: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [currentLevel, setCurrentLevel] = useState(() => partialProgress?.currentLevel || 1);
  const [levelData, setLevelData] = useState<LevelData | null>(() => partialProgress?.levelData || null);
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>(() => partialProgress?.placedBlocks || []);
  const [isCompleted, setIsCompleted] = useState(false);
  const [scaleHintActive, setScaleHintActive] = useState(false);
  const [incorrectMoves, setIncorrectMoves] = useState(() => partialProgress?.incorrectMoves || 0);
  const [finalStars, setFinalStars] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; position: { x: number; y: number } } | null>(null);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const [cellPixelSize, setCellPixelSize] = useState(BASE_BLOCK_UNIT_SIZE_PX);
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const isCompletedRef = useRef(false);

  useEffect(() => {
    if (!levelData || levelData.level !== currentLevel) {
      const newLevelData = generateLevelData(currentLevel);
      setLevelData(newLevelData);
      if (levelData && levelData.level !== currentLevel) {
        setPlacedBlocks([]);
        setIsCompleted(false);
      }
    }
  }, [currentLevel, levelData]);
  
  useLayoutEffect(() => {
    const wrapperEl = gridWrapperRef.current;
    if (!wrapperEl) return;
    const ROW_LABEL_WIDTH_PX = 40;
    const setSize = () => {
      if (gridWrapperRef.current) {
        const wrapperWidth = gridWrapperRef.current.clientWidth;
        const gridWidth = wrapperWidth - ROW_LABEL_WIDTH_PX;
        setCellPixelSize(gridWidth / GRID_COLS);
      }
    };
    setSize();
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(wrapperEl);
    return () => resizeObserver.disconnect();
  }, [levelData]);

  const correctBlocks = placedBlocks.filter(b => b.isCorrect);
  const equationBlocksCount = correctBlocks.length;
  
  const checkPlacement = useCallback((size: number, orientation: BlockOrientation, row: number, col: number): boolean => {
    if (!levelData) return false;
    const { solution } = levelData;
    if (orientation !== solution.orientation) return false;
    if (orientation === 'horizontal') {
      const isCorrectLine = row === solution.line + 0.5;
      const isCorrectRange = col >= solution.start && col < solution.end;
      return isCorrectLine && isCorrectRange;
    } else {
      const isCorrectLine = col === solution.line - 0.5;
      const isCorrectRange = row >= solution.start && row < solution.end;
      return isCorrectLine && isCorrectRange;
    }
  }, [levelData]);

  const handleAddBlock = (blockData: Omit<PlacedBlock, 'id' | 'type'>) => {
    const isOccupied = placedBlocks.some(b => b.position.row === blockData.position.row && b.position.col === blockData.position.col && b.orientation === blockData.orientation);
    if (isOccupied || !levelData) return;
    if (blockData.isCorrect && correctBlocks.length >= levelData.solution.distance) return;
    const newBlock: PlacedBlock = { id: Date.now(), type: `${blockData.orientation[0]}-${blockData.size}`, ...blockData };
    setPlacedBlocks(prev => [...prev, newBlock]);
  };

  const handleInvalidDrop = (reason: 'scale' | 'location' = 'location', position: { x: number; y: number } | null) => {
    setIncorrectMoves(prev => prev + 1);
    if (currentLevel >= 3) {
        if (reason === 'scale' && position) {
          setScaleHintActive(true);
          setFeedback({ message: "Hint! Choose a block that matches the map scale", position });
        }
    }
  };

  const dismissFeedback = () => { setFeedback(null); setScaleHintActive(false); };

  useEffect(() => {
    if (levelData && correctBlocks.length === levelData.solution.distance) {
      setIsCompleted(true);
      if (levelData.level === TOTAL_LEVELS) {
        const rating = (incorrectMoves <= 1) ? 3 : (incorrectMoves <= 4) ? 2 : 1;
        isCompletedRef.current = true;
        onComplete(rating);
        setFinalStars(rating);
      } else {
        // AUTO-ADVANCE logic: No inter-level modal anymore
        setTimeout(() => {
          setCurrentLevel(prev => prev + 1);
        }, 2000);
      }
    } else {
      setIsCompleted(false);
    }
  }, [correctBlocks.length, levelData, incorrectMoves, onComplete]);

  useEffect(() => {
    return () => { if (!isCompletedRef.current && onSavePartialProgress) onSavePartialProgress({ currentLevel, levelData, placedBlocks, incorrectMoves }); };
  }, [onSavePartialProgress, currentLevel, levelData, placedBlocks, incorrectMoves]);
  
  const handleReplay = () => {
    setFinalStars(null); setIncorrectMoves(0); isCompletedRef.current = false;
    onSavePartialProgress?.(null); setPlacedBlocks([]); setIsCompleted(false); setCurrentLevel(1); setFeedback(null);
  };

  if (!levelData) return null;
  const availableSizes = (currentLevel === 1) ? [100] : (currentLevel === 2) ? [200] : [100, 200];

  return (
    <DndProvider backend={backendForDND} options={{ enableMouseEvents: true }}>
      <main className="bg-slate-100 min-h-screen w-full flex items-center justify-center p-4 font-sans relative">
        <InstructionButton onClick={() => setIsInstructionModalOpen(true)} />
        <InstructionModal isOpen={isInstructionModalOpen} onClose={() => setIsInstructionModalOpen(false)} title="Map Scales Instructions">
            <p>Drag the blocks onto the map to measure.</p>
        </InstructionModal>

        {feedback && (
          <div className="fixed inset-0 z-40" onClick={dismissFeedback} aria-label="Close hint" role="button">
            <div className="absolute z-50" style={{ left: feedback.position.x, top: feedback.position.y, transform: 'translate(-50%, -120%)' }} onClick={(e) => e.stopPropagation()}>
              <div className="bg-slate-800 text-white p-2 rounded-lg shadow-xl font-semibold text-sm animate-fade-in-up relative" style={{ whiteSpace: 'nowrap' }} role="alert">
                {feedback.message}
                <div className="absolute left-1/2 w-3 h-3 bg-slate-800 transform -translate-x-1/2 rotate-45" style={{ bottom: '-6px' }}></div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-7xl relative">
          <LevelIndicator level={currentLevel} totalLevels={TOTAL_LEVELS} />
          <header>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
              How far is it from the {levelData.solution.landmark1.label.toLowerCase()} to the {levelData.solution.landmark2.label.toLowerCase()}?
            </h2>
            <p className="text-center text-slate-500 mb-4">Drag the blocks onto the map to measure.</p>
          </header>
          
          <div className="grid lg:grid-cols-[240px_1fr_240px] gap-x-6 items-start mt-2">
            <aside>
              <h3 className="text-xl font-bold text-slate-700 text-center mb-2">Measuring Blocks</h3>
              <BlockPalette scale={levelData.scale} baseUnitSize={cellPixelSize} availableSizes={availableSizes} />
            </aside>

            <div className="flex flex-col items-center relative" ref={gridWrapperRef}>
              <GridMap 
                rows={GRID_ROWS} cols={GRID_COLS} landmarks={levelData.landmarks} scale={levelData.scale} solution={levelData.solution} placedBlocks={placedBlocks} isCompleted={isCompleted} onAddBlock={handleAddBlock} onInvalidDrop={handleInvalidDrop} checkPlacement={checkPlacement} scaleHintActive={scaleHintActive}
              />
              <Equation count={equationBlocksCount} scale={levelData.scale} total={equationBlocksCount * levelData.scale} />
              
              {/* SUCCESS FEEDBACK OVERLAY (NON-MODAL) */}
              {isCompleted && currentLevel < TOTAL_LEVELS && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-fade-in">
                  <div className="bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl text-4xl font-black italic uppercase tracking-tighter border-4 border-white transform scale-110">
                    Correct!
                  </div>
                </div>
              )}
            </div>
            
            <aside><Key landmarks={levelData.landmarks} /></aside>
          </div>
        </div>

        {finalStars !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-[100] p-4 antialiased animate-fade-in">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">Challenge complete!</h2>
              <div className="flex justify-center my-5 md:my-8">
                {[1, 2, 3].map((starIndex) => <StarIcon key={starIndex} filled={starIndex <= finalStars} className="w-12 h-12 md:w-16 md:h-16 mx-1.5 md:mx-2"/>)}
              </div>
              {finalStars < 3 && <p className="text-sm md:text-base text-gray-700/70 mt-3 md:mt-4 px-2">Measure in fewer moves to earn more stars.</p>}
              <div className="mt-6 md:mt-8 flex justify-center items-start gap-4">
                <button onClick={handleReplay} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105" aria-label="Replay the challenge">Replay</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DndProvider>
  );
};

export default CustomMapScalesChallenge;
