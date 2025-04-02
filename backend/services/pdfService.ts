// Move all the logic to the service layer
import fs from 'fs'
import pdfParse from "pdf-parse";
import { Request, Response } from "express";
import OpenAI from 'openai';
import { client } from "../index"



interface PDFParseResult {
  text: string;
  numrender: number,
  numpages: number;
  info: any;
  metadata: any;
  version: string;
}


interface QuizData {
    question: string,
    options: string[],
    answer_index: number,
    }


const parsePDF = async (req: Request, res: Response) => {
    // Picking the file from local machine and reading it in raw Binary foramt: into Buffer
  const existingPdfByte = fs.readFileSync(
    `./file-uploads/${req.file?.filename}`
  );
  // Now parsing the pdf
  const pdf = await pdfParse(existingPdfByte);
  return pdf;
}


const requestLLM = async (pdf: PDFParseResult) => {
// Creating the response from the LLM'
const response = await client.responses.create({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content:
          "You are a quiz generator. Generate questions based on the provided content. Return the response as a JSON array with exactly 10 questions. Each question should have a question string, an array of exactly 4 options, and an answer_index (0-3).",
      },
      {
        role: "user",
        content: `Here is the pdf data that was provided ${pdf.text}. Create a quiz with 10 questions from this content.`,
      },
    ],
    text: {
      "format": {
        "type": "json_schema",
        "name": "quiz_questions",
        "schema": {
          "type": "object",
          "properties": {
            "questions": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "question": {
                    "type": "string"
                  },
                  "options": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "answer_index": {
                    "type": "number",
                  }
                },
                "required": ["question", "options", "answer_index"],
                "additionalProperties": false
              }
            }
          },
          "required": ["questions"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  });

  // Get the data from openai's reposnse
  const content = response.output_text;
  
  if (!content) {
    throw new Error("No content received from OpenAI");
  }
  return content;
}


export { parsePDF, requestLLM };