"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface QuizQuestion {
  question: string;
  options: string[];
  answer_index: number;
}

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

      // Create FormData to send the file
      const formData = new FormData();
      file && formData.append("uploaded-file", file);

      console.log(
        "Attempting to upload file to:",
        "http://localhost:8000/api/uploads"
      );

      // Send the file to your backend using axios
      const response = await axios.post(
        "http://localhost:8000/api/uploads",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      const { questions } = response.data;
      //TODO: Pass the data from the homepage to quiz page using localstorage and not URL
      // Navigate to quiz page with the quiz data in URL state
      const encodedData = encodeURIComponent(JSON.stringify(questions));
      router.push(`/quiz?data=${encodedData}`);
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
    <>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 text-center">
          Welcome: PDF to Quiz generator
        </h1>
        <h3 className="text-lg md:text-xl text-gray-600 mb-8 text-center max-w-2xl">
          Please Upload your pdf in order to get the quiz
        </h3>

        <div className="w-full max-w-md mx-auto">
          <Input
            type="file"
            name="uploaded-file"
            placeholder="upload a file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <Button
          onClick={handleStartQuiz}
          disabled={!file || isLoading}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Start Quiz"}
        </Button>
      </div>
    </>
  );
}
