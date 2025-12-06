export interface WordSearchItem {
  word: string;
  clue: string;
}

export interface WordSearchData {
  items: WordSearchItem[];
}

export interface CrosswordItem {
  clue: string;
  answer: string;
}

export interface CrosswordData {
  items: CrosswordItem[];
}

export interface PairItem {
  term: string;
  definition: string;
}

export interface MatchingData {
  pairs: PairItem[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface GameContent {
  topic: string;
  level1_wordsearch: WordSearchData;
  level2_crossword: CrosswordData;
  level3_memory: MatchingData;
  level4_matching: MatchingData;
  level5_quiz: QuizData;
}

export type GameLevelType = 'wordsearch' | 'crossword' | 'memory' | 'matching' | 'quiz';

export interface LevelConfig {
  id: number;
  type: GameLevelType;
  title: string;
  description: string;
}