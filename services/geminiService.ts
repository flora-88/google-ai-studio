
import { GoogleGenAI, Type } from "@google/genai";
import { SortingQuestion, House, UserProfile, Language } from '../types';
import { LANGUAGE_NAMES } from '../translations';

let ai: GoogleGenAI | null = null;

export const initGemini = (apiKey: string) => {
  ai = new GoogleGenAI({ apiKey });
};

const getAi = () => {
  if (!ai) {
    throw new Error("Gemini API not initialized");
  }
  return ai;
};

const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_SMART = 'gemini-2.5-flash';
const MODEL_IMAGE = 'gemini-2.5-flash-image';

export const generateSortingQuestions = async (user: Partial<UserProfile>, lang: Language): Promise<SortingQuestion[]> => {
  const aiInstance = getAi();
  const langName = LANGUAGE_NAMES[lang];
  const prompt = `
    Generate 10 immersive, multiple-choice questions for the Sorting Hat ceremony in Harry Potter.
    The user is: ${user.name}, Age: ${user.age}, Gender: ${user.gender}.
    
    The questions should cover:
    1. Magic preferences
    2. Ethical dilemmas
    3. Personality traits
    4. Bloodline/Heritage (imagined)
    5. Reaction to danger
    6. Academic interests
    
    IMPORTANT: The questions and options MUST be in ${langName}.
    Return JSON only.
  `;

  const response = await aiInstance.models.generateContent({
    model: MODEL_SMART,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["id", "question", "options"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) return [];
  return JSON.parse(text);
};

export const determineHouse = async (user: Partial<UserProfile>, questions: SortingQuestion[], answers: number[], lang: Language): Promise<{ house: House, reasoning: string }> => {
  const aiInstance = getAi();
  const langName = LANGUAGE_NAMES[lang];
  // Construct a transcript of Q&A
  let transcript = "";
  questions.forEach((q, idx) => {
    transcript += `Q: ${q.question}\nA: ${q.options[answers[idx]]}\n\n`;
  });

  const prompt = `
    You are the Sorting Hat. Analyze these answers from a student named ${user.name} and sort them into a Hogwarts House.
    
    Student Answers:
    ${transcript}
    
    Decide between: Gryffindor, Slytherin, Ravenclaw, Hufflepuff.
    Provide a short, rhyming, or cryptic reasoning typical of the Sorting Hat.
    IMPORTANT: The reasoning MUST be in ${langName}.
  `;

  const response = await aiInstance.models.generateContent({
    model: MODEL_SMART,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          house: { type: Type.STRING, enum: ["Gryffindor", "Slytherin", "Ravenclaw", "Hufflepuff"] },
          reasoning: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to sort");
  return JSON.parse(text);
};

export const generateNPCResponse = async (
  npcName: string, 
  location: string, 
  user: UserProfile, 
  chatHistory: {sender: string, text: string}[], 
  lastMessage: string,
  lang: Language
): Promise<string> => {
  const aiInstance = getAi();
  const langName = LANGUAGE_NAMES[lang];
  const historyText = chatHistory.slice(-5).map(c => `${c.sender}: ${c.text}`).join('\n');
  
  const prompt = `
    Roleplay as ${npcName} in the ${location} at Hogwarts.
    The player is a student named ${user.name} from ${user.house} house.
    
    Context:
    ${historyText}
    Player: ${lastMessage}
    
    Keep the response short (under 2 sentences), immersive, and in character. 
    If it's a ghost, be ghostly. If it's a teacher, be academic.
    IMPORTANT: Reply in ${langName}.
  `;

  const response = await aiInstance.models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
  });

  return response.text || "...";
};

export const generateClassQuestion = async (subject: string, user: UserProfile, lang: Language): Promise<{
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}> => {
  const aiInstance = getAi();
  const langName = LANGUAGE_NAMES[lang];
  const prompt = `
    Generate a multiple-choice question for the Hogwarts class: ${subject}.
    Student: ${user.name} (${user.house}).
    
    The question should test specific lore knowledge or spell usage relevant to ${subject}.
    Provide 4 distinct options.
    Identify the correct option index (0-3).
    Provide a brief explanation/feedback for the answer.
    
    IMPORTANT: Output must be in ${langName}.
  `;

  const response = await aiInstance.models.generateContent({
    model: MODEL_SMART,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { 
            type: Type.ARRAY,
            items: { type: Type.STRING } 
          },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No question generated");
  return JSON.parse(text);
};

export const generateLocationImage = async (description: string): Promise<string> => {
  const aiInstance = getAi();
  const response = await aiInstance.models.generateContent({
    model: MODEL_IMAGE,
    contents: {
      parts: [{ text: `Detailed fantasy concept art of a Harry Potter location: ${description}` }]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error("No image generated");
};

export const editLocationImage = async (base64Image: string, prompt: string): Promise<string> => {
  const aiInstance = getAi();
  const response = await aiInstance.models.generateContent({
    model: MODEL_IMAGE,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Image } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error("No image generated");
};
