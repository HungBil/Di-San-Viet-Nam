import { Router } from "express";
import { chatWithGuide } from "../services/agent.service.js";
import { buildStoryContext } from "../services/content.service.js";
import type { ChatMessage, StoryTargetType } from "../types/index.js";

export const chatRouter = Router();

chatRouter.post("/", async (req, res, next) => {
  try {
    const { artifactId, targetType, targetId, message, history } = req.body as {
      artifactId?: string;
      targetType?: StoryTargetType;
      targetId?: string;
      message?: string;
      history?: ChatMessage[];
    };

    const resolvedTargetType = targetType ?? "artifact";
    const resolvedTargetId = targetId ?? artifactId;

    if (!resolvedTargetId || !message) {
      res.status(400).json({ error: "targetId/artifactId and message are required" });
      return;
    }

    const context = await buildStoryContext(resolvedTargetType, resolvedTargetId);
    if (!context) {
      res.status(404).json({ error: "Guide target not found" });
      return;
    }

    try {
      res.json(await chatWithGuide(context, message, history ?? []));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Agent chat request failed";
      console.error("Agent chat failed:", message);
      res.status(502).json({ error: message });
    }
  } catch (error) {
    next(error);
  }
});
