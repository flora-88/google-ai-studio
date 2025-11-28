
import React, { useState, useEffect } from 'react';
import { ClassTask, UserProfile, Language } from '../types';
import { generateClassQuestion } from '../services/geminiService';
import { Button } from './Button';
import { BookOpen, CheckCircle, AlertCircle, Loader2, Award, XCircle } from 'lucide-react';
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
  const TOTAL_QUESTIONS = 10;
  
  const [questionCount, setQuestionCount] = useState(0);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const t = TRANSLATIONS[language];

  // Helper to fetch the next question
  const fetchNextQuestion = async () => {
    setLoading(true);
    setQuestionData(null);
    setSelectedOption(null);
    setIsCorrect(null);

    try {
      const data = await generateClassQuestion(task.subject, user, language, history);
      setQuestionData(data);
      // Add valid question to history to prevent repeats
      if (data && data.question) {
        setHistory(prev => [...prev, data.question]);
      }
    } catch (e) {
      console.error(e);
      setQuestionData({
          question: "The magical connection seems weak... moving to next topic.",
          options: ["...", "...", "...", "..."],
          correctIndex: 0,
          explanation: "Network interference."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOptionClick = (index: number) => {
    if (!questionData || selectedOption !== null) return;

    setSelectedOption(index);
    const correct = index === questionData.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleContinue = () => {
    if (questionCount < TOTAL_QUESTIONS - 1) {
      setQuestionCount(prev => prev + 1);
      fetchNextQuestion();
    } else {
      setShowSummary(true);
    }
  };

  const handleFinish = () => {
    // Requirement: "10個以上的問題都答對" (Answer at least 10 questions correctly).
    // With a 10 question quiz, this implies a perfect score is needed.
    const passed = score >= 10;
    onComplete(passed);
  };

  if (showSummary) {
     const passed = score >= 10;
     return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-stone-900 relative">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <div className="relative z-10 max-w-md w-full bg-stone-800 p-8 rounded-xl border-2 border-yellow-600 shadow-2xl text-center">
                <div className="mb-6 flex justify-center">
                    {passed ? <Award className="w-20 h-20 text-yellow-400" /> : <XCircle className="w-20 h-20 text-red-500" />}
                </div>
                <h2 className="text-3xl font-display text-parchment mb-2">{t.quizResult}</h2>
                <div className="text-5xl font-bold text-white mb-4">{score} / {TOTAL_QUESTIONS}</div>
                <p className="text-stone-400 mb-8">{passed ? t.passed : t.failed}</p>
                <Button onClick={handleFinish} variant="magic" className="w-full">
                    {t.finishClass}
                </Button>
             </div>
        </div>
     );
  }

  return (
    <div className="h-full flex flex-col p-6 bg-stone-900 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-stone-700 pb-4">
            <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-display text-parchment">{task.subject}</h2>
            </div>
            <div className="text-stone-400 font-serif">
                {t.quizProgress.replace('{current}', String(questionCount + 1)).replace('{total}', String(TOTAL_QUESTIONS))}
            </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col justify-center">
            {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 text-stone-500 animate-pulse">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <p>{t.loadingQuestion}</p>
                </div>
            ) : questionData ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-stone-800 p-6 rounded-lg border border-stone-600 mb-6 shadow-lg">
                        <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-2 block">{t.question}</span>
                        <h3 className="text-xl md:text-2xl text-parchment leading-relaxed font-serif">
                            {questionData.question}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {questionData.options.map((option, idx) => {
                            let statusClass = "border-stone-600 bg-stone-800 hover:bg-stone-700 text-stone-300";
                            let icon = null;

                            if (selectedOption !== null) {
                                if (idx === questionData.correctIndex) {
                                    statusClass = "border-green-600 bg-green-900/30 text-green-200";
                                    icon = <CheckCircle className="w-5 h-5 text-green-500" />;
                                } else if (idx === selectedOption) {
                                    statusClass = "border-red-600 bg-red-900/30 text-red-200";
                                    icon = <AlertCircle className="w-5 h-5 text-red-500" />;
                                } else {
                                    statusClass = "border-stone-700 bg-stone-900 opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(idx)}
                                    disabled={selectedOption !== null}
                                    className={`p-4 rounded-lg border-2 text-left transition-all flex justify-between items-center ${statusClass}`}
                                >
                                    <span className="font-serif text-lg">{option}</span>
                                    {icon}
                                </button>
                            );
                        })}
                    </div>

                    {/* Feedback / Continue */}
                    {selectedOption !== null && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className={`p-4 rounded border mb-4 ${isCorrect ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
                                <h4 className={`font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                    {isCorrect ? t.correct : t.wrong}
                                </h4>
                                <p className="text-stone-300 text-sm italic">
                                    {questionData.explanation}
                                </p>
                             </div>
                             <Button onClick={handleContinue} variant="magic" className="w-full py-3">
                                {questionCount < TOTAL_QUESTIONS - 1 ? t.nextQuestion : t.finishClass}
                             </Button>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    </div>
  );
};
