"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuizService } from "../services";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Home,
  RotateCcw,
  StepForward,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuizQuestion {
  question: string;
  options: string[];
  answer_index: number;
  right_answer_reason: string;
}

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const data = QuizService.getLocalStorage();
    if (data) {
      try {
        setQuestions(data);
        setSelectedAnswer(null);
      } catch (error) {
        console.error("Error parsing quiz data:", error);
      }
    }
  }, []);

  const handleAnswerSelect = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswer(optionIndex);

    if (optionIndex === currentQuestion.answer_index) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="animate-pulse text-gray-500">Loading quiz...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-gray-500">Error: Question not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <div className="text-sm text-gray-500">
              Score: {score}/{currentQuestionIndex + 1}
            </div>
          </div>
          <Progress value={progress} className="h-1" />
          <Separator className="my-4" />
        </div>

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200/50">
            <p className="text-xl text-gray-900 mb-6 leading-relaxed">
              {currentQuestion.question}
            </p>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = index === currentQuestion.answer_index;
                const isSelected = index === selectedAnswer;
                const isAnswered = selectedAnswer !== null;

                return (
                  <motion.div
                    key={index}
                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  >
                    <Button
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 h-auto min-h-[60px] justify-start gap-3 rounded-xl transition-all duration-200 ${
                        isAnswered
                          ? isCorrect
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                            : isSelected
                            ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-50"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      {isAnswered && (
                        <span className="flex-shrink-0">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5" />
                          ) : null}
                        </span>
                      )}
                      <span className="flex-grow">{option}</span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <div className="text-blue-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-700 text-sm">{currentQuestion.right_answer_reason}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedAnswer !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-end"
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 h-12 rounded-full gap-2"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="text-2xl font-semibold text-gray-900">
                    Quiz Complete!
                  </div>
                  <div className="text-xl text-gray-600">
                    Final Score: {score}/{questions.length}
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="rounded-full gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Try Again
                    </Button>
                    <Button
                      onClick={handleGoHome}
                      variant="outline"
                      className="rounded-full gap-2"
                    >
                      <StepForward className="w-4 h-4" />
                      Another Quiz
                    </Button>
                    <Button
                      onClick={handleGoHome}
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-full gap-2"
                    >
                      <Home className="w-4 h-4" />
                      Back to Home
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
