"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { QuizService } from "./services";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleStartQuiz = async () => {
    if (!file) {
      alert("Please upload a PDF file first");
      return;
    }

    try {
      setIsLoading(true);

      const formData = QuizService.createFormData(file);
      console.log(
        "Attempting to upload the file to localhost:8000/api/uploads"
      );

      const questions = await QuizService.uploadPDF(formData);
      console.log(questions);

      QuizService.saveLocalStorage(questions);

      router.push(`/quiz`);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (axios.isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          alert(
            "Could not connect to the server. Please make sure the backend server is running on http://localhost:8000"
          );
        } else if (error.response) {
          alert(`Server error: ${error.response.data.error || error.message}`);
        } else if (error.request) {
          alert(
            "No response received from server. Please check if the server is running."
          );
        } else {
          alert(`Error: ${error.message}`);
        }
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            PDF to Quiz
          </h1>
          <h3 className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto">
            Transform your PDF documents into interactive quizzes
          </h3>
        </motion.div>

        <Card className="w-full max-w-xl p-8 backdrop-blur-lg bg-white/80 border border-gray-200/50 shadow-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Upload PDF
              </label>
              <div className="relative">
                <div className="flex flex-col items-center justify-center">
                  <Input
                    type="file"
                    name="uploaded-file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center min-h-[120px] w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors duration-200 px-4">
                    <FileUp className="h-8 w-8 mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">
                      {file ? file.name : "Choose PDF file"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click or drag & drop
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleStartQuiz}
              disabled={!file || isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  {/* <Icons.spinner className="h-4 w-4 animate-spin" /> */}
                  <span>Processing...</span>
                </div>
              ) : (
                "Start Quiz"
              )}
            </Button>
          </motion.div>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-sm text-gray-500"
        >
          <p>Supported format: PDF</p>
        </motion.div>
      </div>
    </div>
  );
}
