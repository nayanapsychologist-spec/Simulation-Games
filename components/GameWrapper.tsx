import React, { useState, useEffect, useCallback } from 'react';
import { Timer, ArrowLeft, Coins } from 'lucide-react';

interface GameWrapperProps {
  title: string;
  description: string;
  levelId: number;
  onComplete: (score: number) => void;
  onBack: () => void;
  children: (props: { 
    registerCorrectAnswer: () => void; 
    registerWrongAnswer: () => void; 
    completeGame: () => void;
    isGameActive: boolean;
  }) => React.ReactNode;
}

export const GameWrapper: React.FC<GameWrapperProps> = ({ 
  title, 
  description, 
  levelId, 
  onComplete, 
  onBack, 
  children
}) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(0);

  useEffect(() => {
    let interval: number;
    if (gameActive && !showResult) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameActive, showResult]);

  const handleCorrect = useCallback(() => {
    const now = Date.now();
    const timeSinceLast = (now - lastActionTime) / 1000;
    
    // Score calculation: 100 for quick answer, 50 otherwise
    // Note: Games implementing retry logic should likely only call this on the FIRST correct attempt
    // to avoid farming points, but for simplicity here we award points for effort.
    // Ideally, the child component handles "isFirstAttempt" logic if needed.
    const points = timeSinceLast <= 30 ? 100 : 50;
    setScore(prev => prev + points);
    setLastActionTime(now);
  }, [lastActionTime]);

  const handleWrong = useCallback(() => {
    // Reset timer reference for the next attempt logic if desired, 
    // or just leave it running from start of question.
    // setLastActionTime(Date.now()); // Optional: Reset "thinking time" on wrong answer? 
    // Let's keep strictly "time since question appeared" or "time since last correct".
  }, []);

  const completeGame = () => {
    setGameActive(false);
    setShowResult(true);
  };

  const handleStart = () => {
    setShowIntro(false);
    setGameActive(true);
    setLastActionTime(Date.now());
  };

  const handleContinue = () => {
    onComplete(score);
  };

  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounce-short">
          <h2 className="text-3xl font-bold text-indigo-600 mb-2">Level {levelId}</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
          <p className="text-gray-600 mb-8">{description}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={onBack}
              className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300"
            >
              Back
            </button>
            <button 
              onClick={handleStart}
              className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg hover:shadow-xl"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
     return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="mb-6 flex justify-center">
             <Coins className="w-20 h-20 text-yellow-400" />
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">Level Complete!</h2>
          <p className="text-gray-600 mb-4">Great job mastering this level.</p>
          <div className="text-5xl font-bold text-indigo-600 mb-8">{score} pts</div>
          <button 
            onClick={handleContinue}
            className="w-full py-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-indigo-900">{title}</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-yellow-600 font-bold bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
            <Coins className="w-4 h-4 mr-1" />
            {score}
          </div>
          <div className="flex items-center text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded-full">
            <Timer className="w-4 h-4 mr-1" />
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children({ 
          registerCorrectAnswer: handleCorrect, 
          registerWrongAnswer: handleWrong, 
          completeGame,
          isGameActive: gameActive 
        })}
      </div>
    </div>
  );
};