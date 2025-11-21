
import React, { useState, useEffect } from 'react';
import { ClassTask, UserProfile, Language } from '../types';
import { generateClassQuestion } from '../services/geminiService';
import { Button } from './Button';
import { BookOpen, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface ClassSessionProps {
  task: ClassTask;
  user: UserProfile;
  onComplete: (success: boolean) => void;
  language: Language;
}

interface QuestionData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const ClassSession: React.FC<ClassSessionProps> = ({ task, user, onComplete, language }) => {
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const initClass = async () => {
      try {
        const data = await generateClassQuestion(task.subject, user, language);
        setQuestionData(data);
      } catch (e) {
        console.error(e);
        // Fallback data if AI fails
        setQuestionData({
            question: "The magical connection seems weak...",
            options: ["Try again later", "Wait", "Leave", "Refresh"],
            correctIndex: 0,
            explanation: "Please check your connection or API quota."
        });
      } finally {
        setLoading(false);
      }
    };
    initClass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOptionClick = (index: number) => {
    if (!questionData || selectedOption !== null) return; // Prevent changing answer

    setSelectedOption(index);
    const correct = index === questionData.correctIndex;
    setIsCorrect(correct);
  };

  const handleDismiss = () => {
    onComplete(!!isCorrect);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-stone-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      
      {/* Content Container */}
      <div className="relative z-10 max-w-3xl w-full bg-stone-800/90 backdrop-blur-md p-8 rounded-xl border border-stone-600 shadow-2xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between border-b border-stone-700 pb-4">
          <h2 className="text-3xl font-display text-parchment">{task.subject}</h2>
          <span className="text-stone-400 text-sm uppercase tracking-widest">{t.classSession}</span>
        </div>

        {/* Question Area */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-stone-400">
             <Loader2 className="w-12 h-12 animate-spin mb-4 text-yellow-600" />
             <p className="text-lg animate-pulse">{t.loadingQuestion}</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-stone-900/50 p-6 rounded-lg border border-stone-700 mb-6">
               <div className="flex items-start gap-4">
                  <div className="p-3 bg-stone-700 rounded-full shrink-0">
                    <BookOpen className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-300 uppercase text-xs tracking-widest mb-2">{t.question}</h3>
                    <p className="text-xl font-serif leading-relaxed text-parchment">
                      {questionData?.question}
                    </p>
                  </div>
               </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {questionData?.options.map((option, idx) => {
                let btnClass = "p-4 text-left rounded-lg border-2 transition-all relative overflow-hidden ";
                
                if (selectedOption === null) {
                    // Default State
                    btnClass += "bg-stone-700 border-stone-600 hover:bg-stone-600 hover:border-stone-400 text-stone-200";
                } else {
                    if (idx === questionData.correctIndex) {
                        // Correct Answer
                        btnClass += "bg-green-900/50 border-green-500 text-green-100";
                    } else if (idx === selectedOption) {
                        // Wrong Selected Answer
                        btnClass += "bg-red-900/50 border-red-500 text-red-100 opacity-80";
                    } else {
                        // Unselected options
                        btnClass += "bg-stone-800 border-stone-700 text-stone-500 opacity-50";
                    }
                }

                return (
                  <button 
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    disabled={selectedOption !== null}
                    className={btnClass}
                  >
                    <div className="flex items-center justify-between">
                       <span className="font-serif text-lg"><span className="font-bold opacity-50 mr-2">{String.fromCharCode(65 + idx)}.</span> {option}</span>
                       {selectedOption !== null && idx === questionData.correctIndex && <CheckCircle className="w-5 h-5 text-green-400" />}
                       {selectedOption === idx && idx !== questionData.correctIndex && <AlertCircle className="w-5 h-5 text-red-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback / Result */}
            {selectedOption !== null && (
                <div className={`p-4 rounded border animate-in zoom-in duration-300 ${isCorrect ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
                    <h3 className={`font-bold text-lg mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? t.correct : t.wrong}
                    </h3>
                    <p className="text-stone-300 mb-4 italic">
                        {questionData?.explanation}
                    </p>
                    <Button 
                        onClick={handleDismiss} 
                        variant={isCorrect ? 'primary' : 'secondary'} 
                        className="w-full"
                    >
                        {t.continue}
                    </Button>
                </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
