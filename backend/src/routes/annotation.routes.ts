import { Router } from "express";
import { generateAnnotationNarration } from "../services/agent.service.js";

export const annotationRouter = Router();

annotationRouter.post("/narration", async (req, res, next) => {
  try {
    const { text } = req.body as { text?: string };

    if (!text?.trim()) {
      res.status(400).json({ error: "text is required" });
      return;
    }

    res.json(await generateAnnotationNarration(text));
  } catch (error) {
    next(error);
  }
});
