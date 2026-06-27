import { Router } from "express";
import { createShare, getShareStory } from "../services/share.service.js";

export const shareRouter = Router();

shareRouter.post("/", async (req, res, next) => {
  try {
    const { storyId } = req.body as { storyId?: string };
    if (!storyId) {
      res.status(400).json({ error: "storyId is required" });
      return;
    }

    const share = await createShare(storyId);
    if (!share) {
      res.status(404).json({ error: "Story not found" });
      return;
    }
    res.status(201).json(share);
  } catch (error) {
    next(error);
  }
});

shareRouter.get("/:shareId", async (req, res, next) => {
  try {
    const story = await getShareStory(req.params.shareId);
    if (!story) {
      res.status(404).json({ error: "Share not found" });
      return;
    }
    res.json(story);
  } catch (error) {
    next(error);
  }
});

