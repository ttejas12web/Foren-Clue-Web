import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Award, RefreshCw, Loader2, PlayCircle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firestoreUtils';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const GENERIC_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "What is the primary purpose of maintaining a chain of custody?",
    options: [
      "To ensure evidence is not damaged",
      "To document everyone who handled the evidence",
      "To keep track of evidence costs",
      "To speed up the trial process"
    ],
    correctAnswer: 1,
    explanation: "Chain of custody is crucial for legal integrity, documenting exactly who handled the evidence, when, and where, to prove it hasn't been tampered with."
  },
  {
    id: "q2",
    text: "Which type of evidence is considered 'Trace Evidence'?",
    options: [
      "A written confession",
      "A complete firearm",
      "Hair, fibers, or glass fragments",
      "A large pool of blood"
    ],
    correctAnswer: 2,
    explanation: "Trace evidence refers to very small pieces of material like hair, fibers, glass, or paint chips transferred during a crime."
  },
  {
    id: "q3",
    text: "Locard's Exchange Principle states that:",
    options: [
      "Every contact leaves a trace",
      "Evidence must be collected immediately",
      "DNA is the most reliable evidence",
      "Testimony is more important than physical evidence"
    ],
    correctAnswer: 0,
    explanation: "Edmond Locard's principle 'Every contact leaves a trace' is the foundation of forensic science."
  }
];

export function LessonQuiz({ courseId, lessonId, title, questionsOverride }: { courseId: string, lessonId: string, title: string, questionsOverride?: Question[] }) {
  const { user, userProfile } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use generic questions for now. In a real app, these would be fetched per lesson.
  const questions = questionsOverride && questionsOverride.length > 0 ? questionsOverride : GENERIC_QUESTIONS;
  
  // Check if already completed and score is recorded
  useEffect(() => {
    const existingScore = userProfile?.quizScores?.[courseId]?.[lessonId];
    if (existingScore !== undefined) {
      setScore(existingScore);
      setQuizCompleted(true);
    } else {
      resetQuiz();
    }
  }, [courseId, lessonId, userProfile?.quizScores]);

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleRetake = () => {
    resetQuiz();
  };

  const handleAnswerSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedAnswer(index);
  };

  const calculateAndSaveScore = async (finalScore: number) => {
    if (!user) return;
    setIsSaving(true);
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`quizScores.${courseId}.${lessonId}`]: finalScore,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving quiz score:", error);
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;
    
    setIsSubmitted(true);
    
    let newScore = score;
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      newScore += 1;
      setScore(newScore);
    }
    
    // Automatically move to next after a delay, or show completion
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setIsSubmitted(false);
      } else {
        const finalPercent = Math.round((newScore / questions.length) * 100);
        setScore(finalPercent);
        setQuizCompleted(true);
        calculateAndSaveScore(finalPercent);
      }
    }, 2500);
  };

  if (quizCompleted) {
    const passed = score >= 70;
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-surface/30 border border-black/10 dark:border-white/5 rounded-xl text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          {passed ? (
            <div className="w-24 h-24 bg-warning/20 border border-warning/50 rounded-full flex items-center justify-center mx-auto text-warning shadow-[0_0_30px_rgba(241,196,15,0.3)]">
              <Award size={48} />
            </div>
          ) : (
            <div className="w-24 h-24 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <XCircle size={48} />
            </div>
          )}
        </motion.div>
        
        <h3 className="text-2xl font-heading font-black uppercase text-text-main mb-2">
          {passed ? "Investigation Complete" : "Review Required"}
        </h3>
        
        <p className="text-text-muted mb-6 max-w-md mx-auto">
          {passed 
            ? `Excellent work! You demonstrated strong comprehension of ${title}.`
            : `You might want to review the lesson material and try again to improve your score.`
          }
        </p>
        
        <div className="text-5xl font-black text-text-main mb-8 relative">
          {score}%
          <span className="absolute -top-4 -right-12 text-[10px] uppercase tracking-widest text-warning font-bold">Accuracy</span>
        </div>
        
        <button 
          onClick={handleRetake}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-lg font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Retake Quiz
        </button>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const isCorrect = selectedAnswer === q.correctAnswer;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-black uppercase tracking-widest text-text-main flex items-center gap-2">
          <PlayCircle size={18} className="text-warning" />
          Lesson Quiz
        </h3>
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full mb-10 overflow-hidden">
        <motion.div 
          className="h-full bg-warning"
          initial={{ width: `${(currentQuestion / questions.length) * 100}%` }}
          animate={{ width: `${((currentQuestion + (isSubmitted ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-surface/50 border border-black/10 dark:border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden"
        >
          <h4 className="text-xl font-bold text-text-main mb-8">{q.text}</h4>
          
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isSelected = selectedAnswer === i;
              const isRightOption = i === q.correctAnswer;
              
              let optionClasses = "border-black/10 dark:border-white/10 hover:border-black/10 dark:border-white/30 hover:bg-black/5 dark:bg-white/5";
              let icon = <div className="w-5 h-5 rounded-full border border-black/10 dark:border-white/20" />;
              
              if (isSubmitted) {
                if (isRightOption) {
                  optionClasses = "border-green-500/50 bg-green-500/10 text-text-main";
                  icon = <CheckCircle2 size={20} className="text-green-500" />;
                } else if (isSelected) {
                  optionClasses = "border-red-500/50 bg-red-500/10 text-text-main";
                  icon = <XCircle size={20} className="text-red-500" />;
                } else {
                  optionClasses = "border-black/10 dark:border-white/5 opacity-50";
                }
              } else if (isSelected) {
                optionClasses = "border-warning bg-warning/10 text-text-main";
                icon = <div className="w-5 h-5 rounded-full border border-warning flex items-center justify-center"><div className="w-2.5 h-2.5 bg-warning rounded-full" /></div>;
              }

              return (
                <button
                  key={i}
                  disabled={isSubmitted}
                  onClick={() => handleAnswerSelect(i)}
                  className={`w-full flex items-center gap-4 text-left p-4 rounded-lg border transition-all ${optionClasses}`}
                >
                  {icon}
                  <span className="flex-1 font-medium text-sm text-text-muted">{opt}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {isSubmitted && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className={`p-4 rounded-lg flex items-start gap-3 border ${
                  isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <Info size={18} className={`flex-shrink-0 mt-0.5 ${isCorrect ? "text-green-500" : "text-red-500"}`} />
                <div>
                  <p className={`font-bold text-sm mb-1 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                  <p className="text-sm text-text-muted">{q.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-8 flex justify-end">
            <button
              disabled={selectedAnswer === null || isSubmitted}
              onClick={handleSubmit}
              className={`px-8 py-3 rounded-lg font-black uppercase tracking-widest text-xs transition-colors ${
                selectedAnswer === null || isSubmitted 
                  ? "bg-black/5 dark:bg-white/5 text-text-main/30 cursor-not-allowed" 
                  : "bg-warning text-crust hover:bg-warning/90 shadow-[0_0_20px_rgba(241,196,15,0.3)]"
              }`}
            >
              Confirm Analysis
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
