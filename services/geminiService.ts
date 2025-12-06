import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GameContent } from "../types";

// Define the strict schema for the output
const gameSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    level1_wordsearch: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
               word: { type: Type.STRING, description: "The word to find in the grid (no spaces, uppercase)." },
               clue: { type: Type.STRING, description: "A hint or definition for the word." }
             }
          },
          description: "List of 10 word-clue pairs."
        }
      }
    },
    level2_crossword: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              clue: { type: Type.STRING },
              answer: { type: Type.STRING, description: "Single word answer, no spaces." }
            }
          },
          description: "10 clue-answer pairs."
        }
      }
    },
    level3_memory: {
      type: Type.OBJECT,
      properties: {
        pairs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              definition: { type: Type.STRING, description: "Short concise definition." }
            }
          },
          description: "6 pairs for memory game."
        }
      }
    },
    level4_matching: {
      type: Type.OBJECT,
      properties: {
        pairs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              definition: { type: Type.STRING }
            }
          },
          description: "6 pairs for matching game (different from memory game)."
        }
      }
    },
    level5_quiz: {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 options" },
              correctAnswerIndex: { type: Type.INTEGER, description: "0-3 index" },
              difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
            }
          },
          description: "15 questions: 5 easy, 5 medium, 5 hard."
        }
      }
    }
  },
  required: ["topic", "level1_wordsearch", "level2_crossword", "level3_memory", "level4_matching", "level5_quiz"]
};

export const generateGameContent = async (topic: string): Promise<GameContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Create a comprehensive educational game content pack about the topic: "${topic}".
    The content must be suitable for a learning game with 5 levels.
    
    For Level 1 (Word Search), provide words to hide in the grid AND clues to help the student figure out what the word is. 
    Ensure all answers in crosswords and word searches are single words (no spaces).
    Definitions should be concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: gameSchema,
        systemInstruction: "You are an expert educational content generator. Generate accurate, engaging, and age-appropriate content."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    
    return JSON.parse(text) as GameContent;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};