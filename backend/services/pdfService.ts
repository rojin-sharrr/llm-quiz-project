// Move all the logic to the service layer
import fs from "fs";
import pdfParse from "pdf-parse";
import { Request, Response } from "express";
import OpenAI from "openai";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import * as z from "zod";
import { PROMPTS } from "../config/prompts";

const myOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      answer_index: z.number(),
      right_answer_reason: z
        .string()
        .describe("Give why the right answer is correct"),
    })
  ),
});

const model = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})("gpt-4o-mini");

interface PDFParseResult {
  text: string;
  numrender: number;
  numpages: number;
  info: any;
  metadata: any;
  version: string;
}

interface QuizData {
  question: string;
  options: string[];
  answer_index: number;
}

const parsePDF = async (req: Request, res: Response) => {
  // Picking the file from local machine and reading it in raw Binary foramt: into Buffer
  const existingPdfByte = fs.readFileSync(
    `./file-uploads/${req.file?.filename}`
  );
  // Now parsing the pdf
  const pdf = await pdfParse(existingPdfByte);
  return pdf;
};

const requestLLM = async (pdf: PDFParseResult) => {
  const {
    object: { questions },
    usage,
  } = await generateObject({
    model,
    schema: myOutputSchema,
    prompt: PROMPTS.quizPrompt(pdf.text),
  });
  console.log(questions);

  return questions;
};

export { parsePDF, requestLLM };
