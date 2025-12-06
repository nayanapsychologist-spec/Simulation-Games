import React, { useState, useEffect } from 'react';
import { CrosswordData } from '../../types';

interface CrosswordProps {
  data: CrosswordData;
  onRegisterCorrect: () => void;
  onRegisterWrong: () => void;
  onComplete: () => void;
}

export const Crossword: React.FC<CrosswordProps> = ({ data, onRegisterCorrect, onRegisterWrong, onComplete }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);

  const checkAnswer = (index: number, val: string) => {
    const target = data.items[index].answer.toUpperCase();
    if (val.toUpperCase() === target) {
      setCompletedIndices(prev => [...prev, index]);
      onRegisterCorrect();
    }
  };

  const handleChange = (index: number, val: string) => {
    setAnswers(prev => ({ ...prev, [index]: val }));
    // Check strictly if match full length
    if (val.length === data.items[index].answer.length) {
       if (val.toUpperCase() === data.items[index].answer.toUpperCase()) {
         checkAnswer(index, val);
       } else {
         // Wrong answer
         onRegisterWrong();
       }
    }
  };

  useEffect(() => {
    if (completedIndices.length === data.items.length && data.items.length > 0) {
      setTimeout(onComplete, 1000);
    }
  }, [completedIndices, data.items, onComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        {data.items.map((item, idx) => {
           const isCorrect = completedIndices.includes(idx);
           return (
            <div key={idx} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 transition-all ${isCorrect ? 'border-green-500 bg-green-50' : 'border-indigo-400'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 block">Clue {idx + 1}</span>
                  <p className="text-gray-700 font-medium text-lg">{item.clue}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Render individual boxes for letters */}
                  <div className="flex space-x-1">
                    {item.answer.split('').map((_, charIdx) => (
                      <div 
                        key={charIdx} 
                        className={`w-8 h-10 flex items-center justify-center border-b-2 font-bold text-lg uppercase
                          ${isCorrect ? 'border-green-500 text-green-700' : 'border-gray-300 text-gray-400'}
                        `}
                      >
                        {isCorrect ? item.answer[charIdx] : (answers[idx]?.[charIdx] || '')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {!isCorrect && (
                 <input 
                  type="text" 
                  className="w-full mt-4 p-3 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase tracking-widest bg-slate-800 text-white placeholder-gray-500 font-bold shadow-inner"
                  placeholder={`Type ${item.answer.length} letters...`}
                  maxLength={item.answer.length}
                  value={answers[idx] || ''}
                  onChange={(e) => handleChange(idx, e.target.value)}
                 />
              )}
            </div>
           );
        })}
      </div>
    </div>
  );
};