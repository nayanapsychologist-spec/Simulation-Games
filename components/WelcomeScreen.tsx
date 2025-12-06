import React, { useState } from 'react';
import { Sparkles, Brain, Gamepad2, Loader2, PenTool, BookOpen, Wand2 } from 'lucide-react';
import { GameContent } from '../types';
import { generateGameContent } from '../services/geminiService';

interface WelcomeScreenProps {
  onStart: (data: string | GameContent) => void;
  isLoading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isLoading }) => {
  const [mode, setMode] = useState<'student' | 'teacher'>('student');
  const [input, setInput] = useState('');
  const [teacherJson, setTeacherJson] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftTopic, setDraftTopic] = useState('');

  const DEFAULT_TEMPLATE = `{
  "topic": "Custom Topic",
  "level1_wordsearch": { 
    "items": [ 
      { "word": "APPLE", "clue": "Red crunchy fruit" }, 
      { "word": "BANANA", "clue": "Yellow curved fruit" }, 
      { "word": "CHERRY", "clue": "Small red stone fruit" },
      { "word": "DATE", "clue": "Sweet fruit from palm trees" },
      { "word": "FIG", "clue": "Fruit with many seeds inside" },
      { "word": "GRAPE", "clue": "Small round fruit in bunches" },
      { "word": "KIWI", "clue": "Fuzzy brown fruit, green inside" },
      { "word": "LEMON", "clue": "Sour yellow citrus" },
      { "word": "LIME", "clue": "Sour green citrus" },
      { "word": "MELON", "clue": "Large juicy fruit" }
    ] 
  },
  "level2_crossword": { "items": [ { "clue": "Yellow curved fruit", "answer": "BANANA" }, { "clue": "Red crunchy fruit", "answer": "APPLE" } ] },
  "level3_memory": { "pairs": [ { "term": "A", "definition": "First Letter" }, { "term": "B", "definition": "Second Letter" } ] },
  "level4_matching": { "pairs": [ { "term": "Cat", "definition": "Meow" }, { "term": "Dog", "definition": "Woof" } ] },
  "level5_quiz": { "questions": [ { "question": "What is 2+2?", "options": ["3", "4", "5", "6"], "correctAnswerIndex": 1, "difficulty": "easy" } ] }
}`;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onStart(input.trim());
    }
  };

  const handleTeacherSubmit = () => {
    try {
      const parsed = JSON.parse(teacherJson || DEFAULT_TEMPLATE);
      if (!parsed.topic) throw new Error("Missing topic");
      onStart(parsed as GameContent);
    } catch (e) {
      setJsonError("Invalid JSON format. Please check your syntax.");
    }
  };

  const handleGenerateDraft = async () => {
    if (!draftTopic.trim()) return;
    setIsDrafting(true);
    try {
      const content = await generateGameContent(draftTopic);
      setTeacherJson(JSON.stringify(content, null, 2));
      setJsonError('');
    } catch (error) {
      console.error(error);
      setJsonError('Failed to generate draft. Please try again.');
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center relative overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
        
        {/* Mode Toggle */}
        <div className="absolute top-4 right-4 flex space-x-2">
           <button 
             onClick={() => setMode('student')}
             className={`p-2 rounded-full transition-colors ${mode === 'student' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
             title="Student Mode"
           >
             <Brain className="w-5 h-5" />
           </button>
           <button 
             onClick={() => {
               setMode('teacher');
               if(!teacherJson) setTeacherJson(DEFAULT_TEMPLATE);
             }}
             className={`p-2 rounded-full transition-colors ${mode === 'teacher' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
             title="Teacher Mode"
           >
             <PenTool className="w-5 h-5" />
           </button>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="bg-indigo-100 p-4 rounded-full shadow-inner">
            {mode === 'student' ? <Brain className="w-16 h-16 text-indigo-600" /> : <BookOpen className="w-16 h-16 text-indigo-600" />}
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 tracking-tight">
          {mode === 'student' ? 'Knowledge Quest' : 'Teacher Studio'}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {mode === 'student' ? 'Enter a topic to generate a magical world!' : 'Design your own learning adventure.'}
        </p>

        {mode === 'student' ? (
          <form onSubmit={handleStudentSubmit} className="space-y-6">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., Photosynthesis, Ancient Rome..."
                className="w-full px-6 py-4 text-lg border-0 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500 transition-all shadow-inner text-center font-bold bg-slate-100 text-slate-900 placeholder-gray-500"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`
                group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1
                ${(isLoading || !input.trim()) ? 'opacity-70 cursor-not-allowed transform-none' : ''}
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  Let's Begin!
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-left">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">AI Auto-Fill</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={draftTopic}
                    onChange={(e) => setDraftTopic(e.target.value)}
                    placeholder="Enter topic to auto-generate..."
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    onClick={handleGenerateDraft}
                    disabled={isDrafting || !draftTopic.trim()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                  >
                    {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1" />}
                    Generate
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Use AI to generate a draft, then edit the JSON below to perfect your game.
                </p>
             </div>

             <div className="relative">
               <div className="absolute top-0 right-0 bg-slate-700 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                 Game Configuration (JSON)
               </div>
               <textarea
                 value={teacherJson}
                 onChange={(e) => setTeacherJson(e.target.value)}
                 className="w-full h-64 p-4 text-xs font-mono border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-900 text-green-400 resize-none shadow-inner"
                 spellCheck={false}
               />
             </div>
             
             {jsonError && <p className="text-red-500 text-sm font-bold">{jsonError}</p>}
             
             <button
               onClick={handleTeacherSubmit}
               className="w-full py-3 font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all"
             >
               Create Custom Game
             </button>
          </div>
        )}

        <div className="mt-12 grid grid-cols-3 gap-4 text-sm text-gray-500">
          <div className="flex flex-col items-center">
            <Gamepad2 className="w-6 h-6 mb-2 text-pink-500" />
            <span>5 Levels</span>
          </div>
          <div className="flex flex-col items-center">
            <Sparkles className="w-6 h-6 mb-2 text-yellow-500" />
            <span>{mode === 'student' ? 'AI Powered' : 'Customizable'}</span>
          </div>
          <div className="flex flex-col items-center">
            <Brain className="w-6 h-6 mb-2 text-blue-500" />
            <span>Mastery</span>
          </div>
        </div>
      </div>
    </div>
  );
};