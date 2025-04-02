"use client";

import { Button } from "@/src/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  answer_index: number;
}

export default function QuizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        console.log("Backend data:", parsedData);
        setQuestions(parsedData);
        setSelectedAnswer(null);
      } catch (error) {
        console.error("Error parsing quiz data:", error);
      }
    }
  }, [searchParams]);

  const handleAnswerSelect = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    console.log("User selected:", optionIndex);
    console.log("Current question:", currentQuestion);

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading quiz...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="text-lg">{currentQuestion.question}</p>
        </div>

        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => {
            let buttonClass =
              "w-full text-left p-4 bg-white hover:bg-gray-100 text-gray-800";

            if (selectedAnswer !== null) {
              if (index === currentQuestion.answer_index) {
                buttonClass =
                  "w-full text-left p-4 bg-green-500 hover:bg-green-600 text-white";
              } else if (index === selectedAnswer) {
                buttonClass =
                  "w-full text-left p-4 bg-red-500 hover:bg-red-600 text-white";
              }
            }

            return (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={buttonClass}
              >
                {option}
              </Button>
            );
          })}
        </div>

        {selectedAnswer !== null && (
          <div className="mt-8 flex justify-between items-center">
            <p className="text-lg">
              Score: {score}/{currentQuestionIndex + 1}
            </p>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={handleNextQuestion}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Next Question
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="text-xl font-bold">
                  Quiz Complete! Final Score: {score}/{questions.length}
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handleRetry}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={handleGoHome}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
