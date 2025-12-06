import React, { useState, useEffect, useMemo } from 'react';
import { WordSearchData } from '../../types';

interface WordSearchProps {
  data: WordSearchData;
  onRegisterCorrect: () => void;
  onComplete: () => void;
}

// Helper function outside component to avoid dependencies issues
function canPlace(grid: string[], word: string, row: number, col: number, dir: string, size: number) {
  if (dir === 'H' && col + word.length > size) return false;
  if (dir === 'V' && row + word.length > size) return false;

  for (let i = 0; i < word.length; i++) {
    const idx = dir === 'H' ? row * size + (col + i) : (row + i) * size + col;
    if (grid[idx] !== '' && grid[idx] !== word[i]) return false;
  }
  return true;
}

export const WordSearch: React.FC<WordSearchProps> = ({ data, onRegisterCorrect, onComplete }) => {
  const gridSize = 10;
  const [foundWords, setFoundWords] = useState<string[]>([]);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [currentDrag, setCurrentDrag] = useState<number | null>(null);
  
  // Generate Grid
  const { grid, placedWords }: { grid: string[], placedWords: Record<string, number[]> } = useMemo(() => {
    const newGrid = Array(gridSize * gridSize).fill('');
    const placed: Record<string, number[]> = {};
    
    // Sort words by length desc to place large ones first
    const itemsToPlace = [...data.items].sort((a, b) => b.word.length - a.word.length).slice(0, 10);

    itemsToPlace.forEach(item => {
      const wordUpper = item.word.toUpperCase();
      let placedWord = false;
      let attempts = 0;
      
      while (!placedWord && attempts < 100) {
        const direction = Math.random() > 0.5 ? 'H' : 'V';
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        
        if (canPlace(newGrid, wordUpper, row, col, direction, gridSize)) {
          const indices: number[] = [];
          for (let i = 0; i < wordUpper.length; i++) {
            const idx = direction === 'H' ? row * gridSize + (col + i) : (row + i) * gridSize + col;
            newGrid[idx] = wordUpper[i];
            indices.push(idx);
          }
          placed[wordUpper] = indices;
          placedWord = true;
        }
        attempts++;
      }
    });

    // Fill empty
    for (let i = 0; i < newGrid.length; i++) {
      if (!newGrid[i]) {
        newGrid[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }

    return { grid: newGrid, placedWords: placed };
  }, [data.items]);

  // Calculate cells in the drag line
  const getSelectedCells = (start: number | null, end: number | null): number[] => {
    if (start === null || end === null) return [];
    if (start === end) return [start];

    const r1 = Math.floor(start / gridSize);
    const c1 = start % gridSize;
    const r2 = Math.floor(end / gridSize);
    const c2 = end % gridSize;

    const dr = r2 - r1;
    const dc = c2 - c1;

    // Check validity (Horizontal, Vertical, or Diagonal)
    if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
      const steps = Math.max(Math.abs(dr), Math.abs(dc));
      const stepR = dr === 0 ? 0 : dr / steps;
      const stepC = dc === 0 ? 0 : dc / steps;

      const indices = [];
      for (let i = 0; i <= steps; i++) {
        indices.push((r1 + Math.round(i * stepR)) * gridSize + (c1 + Math.round(i * stepC)));
      }
      return indices;
    }
    
    return [start]; // Invalid drag shows just start
  };

  const selection = useMemo(() => getSelectedCells(dragStart, currentDrag), [dragStart, currentDrag]);

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    e.preventDefault(); 
    setIsDragging(true);
    setDragStart(index);
    setCurrentDrag(index);
  };

  const handlePointerEnter = (index: number) => {
    if (isDragging) {
      setCurrentDrag(index);
    }
  };

  const handlePointerUp = () => {
    if (isDragging && selection.length > 0) {
      checkSelection(selection);
    }
    setIsDragging(false);
    setDragStart(null);
    setCurrentDrag(null);
  };

  // Attach global pointer up to catch releases outside the grid
  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [isDragging, selection]);


  const checkSelection = (sel: number[]) => {
    // Check against all un-found words
    const sortedSelection = [...sel].sort((a, b) => a - b);
    
    for (const [word, indices] of Object.entries(placedWords)) {
      if (foundWords.includes(word)) continue;
      
      const sortedIndices = [...indices].sort((a, b) => a - b);
      if (JSON.stringify(sortedSelection) === JSON.stringify(sortedIndices)) {
        // Match!
        setFoundWords(prev => [...prev, word]);
        onRegisterCorrect();
        return;
      }
    }
  };

  useEffect(() => {
    if (foundWords.length === Object.keys(placedWords).length && foundWords.length > 0) {
      setTimeout(onComplete, 1000);
    }
  }, [foundWords, placedWords, onComplete]);

  return (
    <div className="flex flex-col items-center">
      {/* Grid */}
      <div 
        className="grid grid-cols-10 gap-1 bg-white p-3 rounded-xl shadow-lg mb-6 select-none touch-none border-4 border-indigo-100"
        style={{ touchAction: 'none' }}
      >
        {grid.map((char, i) => {
           const isSelected = selection.includes(i);
           const isFound = Object.entries(placedWords).some(([word, indices]) => 
             foundWords.includes(word) && indices.includes(i)
           );
           
           return (
            <div
              key={i}
              onPointerDown={(e) => handlePointerDown(i, e)}
              onPointerEnter={() => handlePointerEnter(i)}
              className={`
                w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-bold rounded-lg cursor-pointer transition-all text-sm md:text-lg
                ${isFound ? 'bg-green-500 text-white shadow-inner transform scale-90' : 
                  isSelected ? 'bg-indigo-500 text-white shadow-lg scale-110 z-10' : 
                  'bg-gray-50 hover:bg-indigo-50 text-gray-800'}
              `}
            >
              {char}
            </div>
          );
        })}
      </div>
      
      {/* Clues */}
      <div className="w-full max-w-2xl bg-white p-4 rounded-xl shadow-sm">
        <h3 className="font-bold text-indigo-900 mb-4 text-center text-lg">Decipher clues to find hidden words:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {data.items.map((item) => {
            // Only show if the word was actually placed
            if (!placedWords[item.word.toUpperCase()]) return null;
            
            const isFound = foundWords.includes(item.word.toUpperCase());
            return (
               <div key={item.word} className={`p-3 rounded-lg border transition-colors ${isFound ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-start">
                     <span className={`${isFound ? 'text-green-800 line-through opacity-70' : 'text-gray-700 font-medium'}`}>
                       {item.clue}
                     </span>
                     {isFound && <span className="text-green-600 font-bold ml-2 text-xs uppercase tracking-wider">{item.word}</span>}
                  </div>
                  {!isFound && <div className="mt-1 flex gap-1">
                     {/* Hint at length */}
                     {Array.from({length: item.word.length}).map((_, i) => (
                        <div key={i} className="w-2 h-0.5 bg-gray-300"></div>
                     ))}
                  </div>}
               </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};