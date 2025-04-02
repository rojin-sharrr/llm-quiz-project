import { config } from "dotenv";
config();
import express, { application, NextFunction, Request, Response } from "express";

import OpenAI from "openai";
import cors from "cors";
import pdfRoutes from './routes/pdfRoutes';


export const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});


const app = express();
const port = 8000;


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
app.use("/api", pdfRoutes);

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
