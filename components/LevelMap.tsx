import React from 'react';
import { Lock, Check, Star } from 'lucide-react';
import { LevelConfig } from '../types';

interface LevelMapProps {
  levels: LevelConfig[];
  currentLevel: number;
  onSelectLevel: (levelId: number) => void;
  scores: Record<number, number>;
  topic: string;
}

export const LevelMap: React.FC<LevelMapProps> = ({ levels, currentLevel, onSelectLevel, scores, topic }) => {
  return (
    <div className="min-h-screen bg-[#f0f4f8] relative overflow-hidden flex flex-col items-center pb-20">
      {/* Header */}
      <div className="w-full bg-white shadow-md p-4 z-10 sticky top-0">
        <div className="max-w-md mx-auto flex justify-between items-center">
           <div>
            <h2 className="text-sm text-gray-500 uppercase font-bold tracking-wider">Topic</h2>
            <h1 className="text-xl font-bold text-indigo-700 capitalize">{topic}</h1>
           </div>
           <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
             <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
             <span className="font-bold text-yellow-700">{Object.values(scores).reduce((a: number, b: number) => a + b, 0)}</span>
           </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 w-full max-w-md relative mt-8 px-4">
        {/* SVG Path for connecting dots */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ height: '600px' }}>
           <path 
             d="M 50% 60 Q 20% 160 50% 180 T 50% 300 T 50% 420 T 50% 540" 
             fill="none" 
             stroke="#cbd5e1" 
             strokeWidth="8" 
             strokeLinecap="round"
             strokeDasharray="12 8"
           />
        </svg>

        <div className="space-y-16 relative z-10 pt-4 flex flex-col items-center">
          {levels.map((level, index) => {
            const isLocked = level.id > currentLevel;
            const isCompleted = level.id < currentLevel;
            const isCurrent = level.id === currentLevel;
            
            // Visual positioning stagger
            const alignment = index % 2 === 0 ? 'translate-x-0' : index % 4 === 1 ? '-translate-x-12' : 'translate-x-12';

            return (
              <div key={level.id} className={`relative ${alignment}`}>
                <button
                  onClick={() => !isLocked && onSelectLevel(level.id)}
                  disabled={isLocked}
                  className={`
                    w-24 h-24 rounded-full flex items-center justify-center shadow-[0_6px_0_rgb(0,0,0,0.2)] transition-all transform
                    ${isLocked ? 'bg-gray-300 cursor-not-allowed' : 
                      isCompleted ? 'bg-green-500 hover:bg-green-600 hover:scale-105' : 
                      'bg-indigo-500 hover:bg-indigo-600 hover:scale-110 animate-bounce-short'}
                  `}
                >
                  {isLocked ? (
                    <Lock className="w-8 h-8 text-gray-500" />
                  ) : isCompleted ? (
                    <div className="text-center">
                      <Check className="w-8 h-8 text-white mx-auto mb-1" />
                      <span className="text-xs font-bold text-green-100 block">DONE</span>
                    </div>
                  ) : (
                     <span className="text-3xl font-bold text-white font-fredoka">{level.id}</span>
                  )}
                </button>
                
                {/* Label */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-32 text-center">
                   <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isCurrent ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}>
                     {level.title}
                   </span>
                   {scores[level.id] > 0 && (
                     <div className="flex justify-center items-center mt-1">
                        {[1, 2, 3].map(s => (
                          <Star key={s} className={`w-3 h-3 ${scores[level.id] >= (s * 50) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                     </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};