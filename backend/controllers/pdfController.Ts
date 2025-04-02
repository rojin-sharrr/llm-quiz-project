import { Request, Response } from "express";
import { parsePDF, requestLLM } from "../services/pdfService";



interface QuizData {
question: string,
options: string[],
answer_index: number,
}

const parseToQuizController = async (req: Request, res: Response) => {

     // Print the file that was uploaded, the file has been made accessible by multer.
    console.log(req.file);
    const pdf = await parsePDF(req, res)
    console.log(pdf)

    const content = await requestLLM(pdf);
  
   const quizData = JSON.parse(content) as QuizData[];
   console.log(quizData);
   res.json(quizData);
}



export default parseToQuizController;