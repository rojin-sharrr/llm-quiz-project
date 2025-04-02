import parseToQuizController from "../controllers/pdfController";
import express, { Request, Response } from "express";
const router = express.Router();
import { upload } from "../middleware/upload";

router.route('/uploads').post(upload.single("uploaded-file"), parseToQuizController);

export default router;

