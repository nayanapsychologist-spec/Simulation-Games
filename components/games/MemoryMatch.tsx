import React, { useState, useEffect } from 'react';
import { MatchingData } from '../../types';
import { HelpCircle } from 'lucide-react';

interface MemoryMatchProps {
  data: MatchingData;
  onRegisterCorrect: () => void;
  onComplete: () => void;
}

interface Card {
  id: number;
  content: string;
  type: 'term' | 'def';
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

export const MemoryMatch: React.FC<MemoryMatchProps> = ({ data, onRegisterCorrect, onComplete }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialize cards
    const newCards: Card[] = [];
    data.pairs.forEach((pair, index) => {
      newCards.push({ id: index * 2, content: pair.term, type: 'term', pairId: index, flipped: false, matched: false });
      newCards.push({ id: index * 2 + 1, content: pair.definition, type: 'def', pairId: index, flipped: false, matched: false });
    });
    // Shuffle
    newCards.sort(() => Math.random() - 0.5);
    setCards(newCards);
  }, [data]);

  const handleCardClick = (id: number) => {
    if (isProcessing) return;
    const cardIndex = cards.findIndex(c => c.id === id);
    if (cards[cardIndex].flipped || cards[cardIndex].matched) return;

    const newCards = [...cards];
    newCards[cardIndex].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      checkForMatch(newFlipped, newCards);
    }
  };

  const checkForMatch = (flippedIds: number[], currentCards: Card[]) => {
    const card1 = currentCards.find(c => c.id === flippedIds[0]);
    const card2 = currentCards.find(c => c.id === flippedIds[1]);

    if (card1 && card2 && card1.pairId === card2.pairId) {
      // Match
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          (c.id === card1.id || c.id === card2.id) ? { ...c, matched: true } : c
        ));
        setFlippedCards([]);
        setIsProcessing(false);
        onRegisterCorrect();
      }, 500);
    } else {
      // No Match
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          (c.id === card1!.id || c.id === card2!.id) ? { ...c, flipped: false } : c
        ));
        setFlippedCards([]);
        setIsProcessing(false);
      }, 1500);
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setTimeout(onComplete, 1000);
    }
  }, [cards, onComplete]);

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      {cards.map(card => (
        <div 
          key={card.id}
          onClick={() => handleCardClick(card.id)}
          className={`
            relative h-32 md:h-40 cursor-pointer perspective-1000 transition-all duration-300
            ${card.matched ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}
        >
          <div className={`
            w-full h-full transition-transform duration-500 transform-style-3d rounded-xl shadow-lg
            ${card.flipped ? 'rotate-y-180' : ''}
          `}
            style={{ transform: card.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transformStyle: 'preserve-3d' }}
          >
            {/* Front (Hidden) */}
            <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white border-4 border-white">
              <HelpCircle className="w-10 h-10 opacity-50" />
            </div>

            {/* Back (Revealed) */}
            <div className="absolute w-full h-full backface-hidden bg-white rounded-xl flex items-center justify-center p-3 text-center border-2 border-indigo-200" 
              style={{ transform: 'rotateY(180deg)' }}
            >
              <p className={`font-bold ${card.type === 'term' ? 'text-lg text-indigo-700' : 'text-sm text-gray-600'}`}>
                {card.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};