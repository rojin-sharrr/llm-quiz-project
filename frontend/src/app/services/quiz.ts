import axios from "axios";
import { TQuizQuestion } from "../types/quiz";

const BACKEND_BASE_URI = "http://localhost:8000/api";
const QUIZ_STORAGE_KEY = "quiz_data";


const createFormData = (file: File) : FormData  => {
   // Create FormData to send the file
   const formData = new FormData();
   file && formData.append("uploaded-file", file);

   return formData;
}

const uploadPDF = async (formData: FormData): Promise<TQuizQuestion[]> => {
  const response = await axios.post(`${BACKEND_BASE_URI}/uploads`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 30000, // 30 seconds timeout
  });
  // upload to backend
  // see response
  // processes

  return response?.data.questions as TQuizQuestion[];
};

// Services for saving to localStorage
const saveLocalStorage = (quizData: TQuizQuestion[]): void => {
  try {
    // Convert the data to a string
    const localData = JSON.stringify(quizData);
    // Save to localStorage
    localStorage.setItem(QUIZ_STORAGE_KEY, localData);
  } catch (error) {
    console.error("Error saving quiz data to localStorage:", error);
    throw new Error("Failed to save quiz data");
  }
};

// Servive for getting the data from localStorage
const getLocalStorage = (): TQuizQuestion[] | null => {
  try {
    const localData = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!localData) return null;
    return JSON.parse(localData);
  } catch (error) {
    console.error("Error retrieving quiz data from localStorage:", error);
    return null;
  }
};

// parse pdf
// generate quiz

export default {
  createFormData,
  uploadPDF,
  saveLocalStorage,
  getLocalStorage,
};
