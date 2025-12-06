import React, { useState, useEffect } from 'react';
import { MatchingData } from '../../types';

interface MatchingGameProps {
  data: MatchingData;
  onRegisterCorrect: () => void;
  onRegisterWrong: () => void;
  onComplete: () => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ data, onRegisterCorrect, onRegisterWrong, onComplete }) => {
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]); // Indices of data.pairs that are solved
  const [hintId, setHintId] = useState<number | null>(null); // Highlights correct answer on error
  
  const [terms, setTerms] = useState<{text: string, originalIndex: number}[]>([]);
  const [definitions, setDefinitions] = useState<{text: string, originalIndex: number}[]>([]);

  useEffect(() => {
    setTerms(data.pairs.map((p, i) => ({ text: p.term, originalIndex: i })).sort(() => Math.random() - 0.5));
    setDefinitions(data.pairs.map((p, i) => ({ text: p.definition, originalIndex: i })).sort(() => Math.random() - 0.5));
  }, [data]);

  const handleTermClick = (originalIndex: number) => {
    if (hintId !== null) return; // Block input during hint
    setSelectedTerm(originalIndex);
  };

  const handleDefClick = (originalIndex: number) => {
    if (selectedTerm === null || hintId !== null) return;

    if (selectedTerm === originalIndex) {
      // Match
      setMatchedPairs(prev => [...prev, originalIndex]);
      setSelectedTerm(null);
      onRegisterCorrect();
    } else {
      // Wrong
      onRegisterWrong();
      
      // Show hint: Highlight the definition that WAS correct for the selected term
      setHintId(selectedTerm);
      
      setTimeout(() => {
        setHintId(null);
        setSelectedTerm(null);
      }, 1500);
    }
  };

  useEffect(() => {
    if (matchedPairs.length === data.pairs.length && data.pairs.length > 0) {
      setTimeout(onComplete, 1000);
    }
  }, [matchedPairs, data.pairs, onComplete]);

  return (
    <div className="flex flex-col md:flex-row justify-between gap-8 max-w-4xl mx-auto h-full">
      {/* Terms Column */}
      <div className="flex-1 space-y-3">
        <h3 className="text-center font-bold text-gray-500 mb-4">Terms</h3>
        {terms.map((item) => {
          const isMatched = matchedPairs.includes(item.originalIndex);
          const isSelected = selectedTerm === item.originalIndex;
          
          if (isMatched) return <div key={item.originalIndex} className="h-16 bg-gray-100 rounded-xl border border-gray-200 opacity-30" />; 

          return (
            <button
              key={item.originalIndex}
              onClick={() => handleTermClick(item.originalIndex)}
              className={`
                w-full p-4 rounded-xl font-bold text-lg transition-all shadow-md border-2
                ${isSelected 
                  ? 'bg-indigo-600 text-white border-indigo-600 scale-105' 
                  : 'bg-white text-gray-700 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50'}
              `}
            >
              {item.text}
            </button>
          );
        })}
      </div>

      {/* Definitions Column */}
      <div className="flex-1 space-y-3">
        <h3 className="text-center font-bold text-gray-500 mb-4">Definitions</h3>
        {definitions.map((item) => {
           const isMatched = matchedPairs.includes(item.originalIndex);
           const isHint = hintId === item.originalIndex;
           
           if (isMatched) return <div key={item.originalIndex} className="h-16 bg-gray-100 rounded-xl border border-gray-200 opacity-30" />;

           return (
            <button
              key={item.originalIndex}
              onClick={() => handleDefClick(item.originalIndex)}
              className={`
                w-full p-4 rounded-xl text-sm text-left transition-all shadow-md border-2
                ${isHint 
                   ? 'bg-green-100 border-green-500 text-green-800 scale-105 ring-2 ring-green-400'
                   : 'bg-white text-gray-700 border-purple-100 hover:border-purple-300 hover:bg-purple-50'
                }
              `}
            >
              {item.text}
              {isHint && <span className="block text-xs font-bold text-green-600 mt-1">(Correct Match)</span>}
            </button>
           );
        })}
      </div>
    </div>
  );
};