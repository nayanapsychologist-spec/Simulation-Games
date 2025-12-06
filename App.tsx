import React, { useState } from 'react';
import { generateGameContent } from './services/geminiService';
import { GameContent, LevelConfig } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LevelMap } from './components/LevelMap';
import { GameWrapper } from './components/GameWrapper';
import { Trophy, Crown, Star, RefreshCcw } from 'lucide-react';

// Game Components
import { WordSearch } from './components/games/WordSearch';
import { Crossword } from './components/games/Crossword';
import { MemoryMatch } from './components/games/MemoryMatch';
import { MatchingGame } from './components/games/MatchingGame';
import { Quiz } from './components/games/Quiz';

const App: React.FC = () => {
  const [gameData, setGameData] = useState<GameContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1); // Highest unlocked level
  const [activeLevel, setActiveLevel] = useState<number | null>(null); // Currently playing
  const [scores, setScores] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [showChampion, setShowChampion] = useState(false);

  const handleStartGame = async (input: string | GameContent) => {
    setLoading(true);
    try {
      let data: GameContent;
      if (typeof input === 'string') {
         data = await generateGameContent(input);
      } else {
         data = input;
      }
      setGameData(data);
      // Reset progress
      setCurrentLevel(1);
      setScores({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      setShowChampion(false);
      setActiveLevel(null);
    } catch (error) {
      alert("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLevelComplete = (levelId: number, score: number) => {
    // Update Score
    setScores(prev => ({ ...prev, [levelId]: Math.max(prev[levelId], score) }));
    
    // Unlock next level if we just beat the current max level
    if (levelId === currentLevel && currentLevel < 5) {
      setCurrentLevel(prev => prev + 1);
    }
    
    if (levelId === 5) {
      setShowChampion(true);
    }
    
    // Return to map (or champion screen handled by state)
    setActiveLevel(null);
  };

  const LEVEL_CONFIGS: LevelConfig[] = [
    { id: 1, type: 'wordsearch', title: 'Word Hunt', description: 'Find the hidden words to start your journey.' },
    { id: 2, type: 'crossword', title: 'Crossword', description: 'Solve clues to reveal key terms.' },
    { id: 3, type: 'memory', title: 'Memory Lane', description: 'Match terms and definitions from memory.' },
    { id: 4, type: 'matching', title: 'Connector', description: 'Draw connections between concepts.' },
    { id: 5, type: 'quiz', title: 'Final Exam', description: 'Prove your mastery in this rapid-fire challenge.' },
  ];

  // Render Active Game
  const renderGame = () => {
    if (!activeLevel || !gameData) return null;

    const config = LEVEL_CONFIGS.find(l => l.id === activeLevel)!;

    return (
      <GameWrapper
        title={config.title}
        description={config.description}
        levelId={activeLevel}
        onBack={() => setActiveLevel(null)}
        onComplete={(score) => handleLevelComplete(activeLevel, score)}
      >
        {({ registerCorrectAnswer, registerWrongAnswer, completeGame }) => {
          switch (activeLevel) {
            case 1: return <WordSearch data={gameData.level1_wordsearch} onRegisterCorrect={registerCorrectAnswer} onComplete={completeGame} />;
            case 2: return <Crossword data={gameData.level2_crossword} onRegisterCorrect={registerCorrectAnswer} onRegisterWrong={registerWrongAnswer} onComplete={completeGame} />;
            case 3: return <MemoryMatch data={gameData.level3_memory} onRegisterCorrect={registerCorrectAnswer} onComplete={completeGame} />;
            case 4: return <MatchingGame data={gameData.level4_matching} onRegisterCorrect={registerCorrectAnswer} onRegisterWrong={registerWrongAnswer} onComplete={completeGame} />;
            case 5: return <Quiz data={gameData.level5_quiz} onRegisterCorrect={registerCorrectAnswer} onRegisterWrong={registerWrongAnswer} onComplete={completeGame} />;
            default: return <div>Unknown Level</div>;
          }
        }}
      </GameWrapper>
    );
  };

  if (!gameData) {
    return <WelcomeScreen onStart={handleStartGame} isLoading={loading} />;
  }

  if (showChampion) {
    const totalScore = Object.values(scores).reduce((a: number, b: number) => a + b, 0);
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 max-w-xl w-full text-center shadow-2xl relative overflow-hidden animate-bounce-short">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
             <div className="absolute top-20 right-20 w-3 h-3 bg-pink-400 rounded-full animate-ping delay-100" />
          </div>
          
          <div className="mb-8 flex justify-center">
             <div className="relative">
               <Crown className="w-32 h-32 text-yellow-500 filter drop-shadow-lg" />
               <Star className="absolute top-0 right-0 w-12 h-12 text-yellow-300 animate-spin-slow" />
             </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4">Champion!</h1>
          <p className="text-xl text-gray-600 mb-8">
            You have mastered the topic <span className="font-bold text-indigo-600">{gameData.topic}</span>!
          </p>

          <div className="bg-indigo-50 rounded-xl p-6 mb-8">
            <div className="text-sm text-indigo-600 font-bold uppercase tracking-wider mb-2">Total Score</div>
            <div className="text-6xl font-bold text-indigo-800">{totalScore}</div>
          </div>

          <button 
            onClick={() => setGameData(null)}
            className="flex items-center justify-center w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 shadow-lg transition-transform hover:scale-105"
          >
            <RefreshCcw className="w-6 h-6 mr-2" />
            Start New Adventure
          </button>
        </div>
      </div>
    );
  }

  if (activeLevel) {
    return renderGame();
  }

  return (
    <LevelMap 
      levels={LEVEL_CONFIGS} 
      currentLevel={currentLevel} 
      onSelectLevel={setActiveLevel} 
      scores={scores}
      topic={gameData.topic}
    />
  );
};

export default App;