import express from "express";
import { askAI } from '../controllers/ai.controller.js'
import { validate } from "../middleware/validate.js";
import { askSchema } from "../validators/askSchema.js";

const router = express.Router();

router.post("/ask", validate(askSchema), askAI);

export default router;