import React, { useState, useEffect } from 'react';
import { QuizData, QuizQuestion } from '../../types';
import { CheckCircle, XCircle, ArrowRight, AlertCircle } from 'lucide-react';

interface QuizProps {
  data: QuizData;
  onRegisterCorrect: () => void;
  onRegisterWrong: () => void;
  onComplete: () => void;
}

interface QuestionItem {
  question: QuizQuestion;
  originalIndex: number;
  isRetry: boolean;
}

export const Quiz: React.FC<QuizProps> = ({ data, onRegisterCorrect, onRegisterWrong, onComplete }) => {
  // Initialize queue with original questions
  const [queue, setQueue] = useState<QuestionItem[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  
  // UI States
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    const initialQueue = data.questions.map((q, i) => ({
      question: q,
      originalIndex: i,
      isRetry: false
    }));
    setQueue(initialQueue);
  }, [data]);

  const currentItem = queue[currentQueueIndex];

  const handleOptionClick = (optionIndex: number) => {
    if (isAnswered || !currentItem) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentItem.question.correctAnswerIndex;
    
    if (isCorrect) {
      setFeedbackStatus('correct');
      // Only give points if it's not a retry (optional, but fairness suggests less points for retries)
      // However, user specs say "Repeat questions... so learner learns". 
      // Simpler to just award points for the action of getting it right now, or maybe reduced.
      // We'll call onRegisterCorrect regardless, but GameWrapper might handle timing.
      if (!currentItem.isRetry) {
        onRegisterCorrect();
      }
    } else {
      setFeedbackStatus('incorrect');
      onRegisterWrong();
      
      // Add clone of this question to the end of the queue
      setQueue(prev => [
        ...prev, 
        { ...currentItem, isRetry: true }
      ]);
    }
  };

  const handleNext = () => {
    if (currentQueueIndex < queue.length - 1) {
      setCurrentQueueIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setFeedbackStatus(null);
    } else {
      onComplete();
    }
  };

  if (!currentItem) return <div>Loading...</div>;

  // Difficulty badge color
  const diffColor = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <span className="text-gray-500 font-bold">
          Progress: {currentQueueIndex + 1} / {queue.length}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${diffColor[currentItem.question.difficulty]}`}>
          {currentItem.question.difficulty}
        </span>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 text-center relative overflow-hidden">
        {feedbackStatus === 'incorrect' && (
           <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
        )}
        {feedbackStatus === 'correct' && (
           <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
        )}
        
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-2">{currentItem.question.question}</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentItem.question.options.map((option, idx) => {
            let statusClass = "bg-white border-2 border-gray-200 hover:border-indigo-400 text-gray-700";
            
            if (isAnswered) {
              if (idx === currentItem.question.correctAnswerIndex) {
                statusClass = "bg-green-500 border-green-600 text-white";
              } else if (idx === selectedOption) {
                statusClass = "bg-red-500 border-red-600 text-white";
              } else {
                statusClass = "bg-gray-100 border-gray-200 text-gray-400 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswered}
                className={`
                  p-4 rounded-xl font-medium text-lg transition-all transform active:scale-95 flex items-center justify-between text-left
                  ${statusClass}
                `}
              >
                <span>{option}</span>
                {isAnswered && idx === currentItem.question.correctAnswerIndex && <CheckCircle className="w-6 h-6 shrink-0 ml-2" />}
                {isAnswered && idx === selectedOption && idx !== currentItem.question.correctAnswerIndex && <XCircle className="w-6 h-6 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>

        {/* Feedback & Next Area */}
        {isAnswered && (
          <div className={`p-6 rounded-xl border-l-4 animate-bounce-short ${feedbackStatus === 'correct' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
            <div className="flex items-start justify-between">
               <div>
                  <h4 className={`text-lg font-bold mb-1 ${feedbackStatus === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                    {feedbackStatus === 'correct' ? 'Correct!' : 'Not quite right...'}
                  </h4>
                  {feedbackStatus === 'incorrect' && (
                    <div className="text-red-700 flex items-center">
                       <AlertCircle className="w-4 h-4 mr-2" />
                       <span>The correct answer is: <strong>{currentItem.question.options[currentItem.question.correctAnswerIndex]}</strong></span>
                    </div>
                  )}
                  {feedbackStatus === 'incorrect' && (
                    <p className="text-sm text-red-600 mt-2">This question will appear again at the end.</p>
                  )}
               </div>
               
               <button 
                 onClick={handleNext}
                 className={`px-6 py-3 rounded-lg text-white font-bold shadow-md flex items-center transition-colors ${
                   feedbackStatus === 'correct' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                 }`}
               >
                 Next <ArrowRight className="w-5 h-5 ml-2" />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};