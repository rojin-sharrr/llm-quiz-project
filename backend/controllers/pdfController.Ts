import { Request, Response } from "express";
import { parsePDF, requestLLM } from "../services/pdfService";

const parseToQuizController = async (req: Request, res: Response) => {
  // Print the file that was uploaded, the file has been made accessible by multer.
  const pdf = await parsePDF(req, res);

  const quizData = await requestLLM(pdf);

  res.json(quizData);
};

export default parseToQuizController;
