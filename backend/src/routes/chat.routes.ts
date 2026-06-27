import { Router } from "express";
import { chatWithGuide } from "../services/agent.service.js";
import { buildStoryContext } from "../services/content.service.js";
import type { ChatMessage } from "../types/index.js";

export const chatRouter = Router();

chatRouter.post("/", async (req, res, next) => {
  try {
    const { artifactId, message, history } = req.body as {
      artifactId?: string;
      message?: string;
      history?: ChatMessage[];
    };

    if (!artifactId || !message) {
      res.status(400).json({ error: "artifactId and message are required" });
      return;
    }

    const context = await buildStoryContext("artifact", artifactId);
    if (!context) {
      res.status(404).json({ error: "Artifact not found" });
      return;
    }

    res.json(await chatWithGuide(context, message, history ?? []));
  } catch (error) {
    next(error);
  }
});

