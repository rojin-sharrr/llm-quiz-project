import { config } from "dotenv";
config();
import express, { application, NextFunction, Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
import OpenAI from "openai";
import cors from "cors";

const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

interface QuizData {
  question: string;
  options: string[];
  answer_index: number;
}

const app = express();
const port = 8000;
const allowedFileMimeType = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.spreadsheet",
  "application/vnd.google-apps.presentation",
];

// Multer: middleware that helps us to receive/ processd and stores the fiiles
/**
 * params
 * @Options: An optional object instance, that takes keys/atriobutes such as dest, storeage,
 *           limits, etc
 */
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./file-uploads");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
      // get the extension
      const extension = file.originalname.split(".").pop();
      // get the name without extension
      const withoutExtension = file.originalname.split(".")[0];
      // Put the name all-together
      cb(null, withoutExtension + uniqueSuffix + "." + extension);
    },
  }),

  fileFilter: function (req: Request, file, cb) {
    //TODO: Check for Virus
    if (allowedFileMimeType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send(" API running succesfully");
});

// PDF Upload route
app.post("/api/uploads", upload.single("uploaded-file"), async (req, res) => {
  console.log(req.file);
  //res.send("PDF Uploaded Succesfully");

  // Picking the file from local machine and reading it in raw Binary foramt: into Buffer
  const existingPdfByte = fs.readFileSync(
    `./file-uploads/${req.file?.filename}`
  );
  // Now parsing the pdf
  const pdf = await pdfParse(existingPdfByte);
  console.log(pdf);

  // Creating the response from the LLM'
  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
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
    //TODO: Fix the return schema based on NT's last project
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  const quizData = JSON.parse(content) as QuizData[];
  console.log(content);
  res.json(quizData);
});

// handle errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(400).json({
    message: err.message,
    extrainfo: err.stack,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
