import React, { useEffect, useState } from 'react';
import { UserProfile, SortingQuestion, House, Language } from '../types';
import { generateSortingQuestions, determineHouse } from '../services/geminiService';
import { TRANSLATIONS } from '../translations';

interface SortingCeremonyProps {
  user: UserProfile;
  onComplete: (house: House) => void;
  language: Language;
}

export const SortingCeremony: React.FC<SortingCeremonyProps> = ({ user, onComplete, language }) => {
  const [questions, setQuestions] = useState<SortingQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [resultReasoning, setResultReasoning] = useState('');
  
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const qs = await generateSortingQuestions(user, language);
        setQuestions(qs);
      } catch (e) {
        console.error("Failed to generate questions", e);
        setQuestions([
            {id: 1, question: "...", options: ["...", "...", "...", "..."]},
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = async (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentStep < 9 && currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Done
      setAnalyzing(true);
      try {
        const result = await determineHouse(user, questions, newAnswers, language);
        setResultReasoning(result.reasoning);
        setTimeout(() => {
          onComplete(result.house as House);
        }, 4000);
      } catch (e) {
        console.error(e);
        onComplete(House.Gryffindor);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-parchment font-serif">
        <div className="text-2xl animate-pulse">{t.sortingThinking}</div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-parchment font-serif p-8 text-center">
        <h2 className="text-4xl font-display mb-6 text-yellow-500">{t.difficult}</h2>
        {resultReasoning && (
          <p className="text-2xl italic text-stone-300 animate-in fade-in duration-1000 max-w-2xl">
            "{resultReasoning}"
          </p>
        )}
      </div>
    );
  }

  const currentQ = questions[currentStep];

  return (
    <div className="min-h-screen bg-stone-900 text-parchment flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-stone-800 p-8 rounded-xl border border-stone-600 shadow-2xl">
        <div className="flex justify-between items-center mb-6 text-stone-400 font-serif">
          <span>{t.question} {currentStep + 1} / {questions.length}</span>
          <span>{user.name}</span>
        </div>

        <h2 className="text-3xl font-serif mb-8 leading-relaxed">
          {currentQ?.question}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {currentQ?.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="p-4 text-left bg-stone-700 hover:bg-stone-600 border border-stone-600 rounded-lg transition-colors font-serif text-lg"
            >
              {String.fromCharCode(65 + idx)}. {option}
            </button>
          ))}
        </div>
        
        <div className="mt-8 w-full bg-stone-900 h-2 rounded-full overflow-hidden">
            <div 
                className="h-full bg-purple-600 transition-all duration-500"
                style={{ width: `${((currentStep) / questions.length) * 100}%`}}
            />
        </div>
      </div>
    </div>
  );
};