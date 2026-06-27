import { Router } from "express";
import { createStory, getStoryById } from "../services/story.service.js";
import type { AgeGroup, StoryTargetType } from "../types/index.js";

export const storyRouter = Router();

const targetTypes = new Set<StoryTargetType>(["landmark", "artifact"]);
const ageGroups = new Set<AgeGroup>(["kids", "teens", "adults"]);

storyRouter.post("/", async (req, res, next) => {
  try {
    const { targetType, targetId, ageGroup } = req.body as {
      targetType?: StoryTargetType;
      targetId?: string;
      ageGroup?: AgeGroup;
    };

    if (!targetType || !targetTypes.has(targetType) || !targetId || !ageGroup || !ageGroups.has(ageGroup)) {
      res.status(400).json({ error: "targetType, targetId and ageGroup are required" });
      return;
    }

    const story = await createStory(targetType, targetId, ageGroup);
    if (!story) {
      res.status(404).json({ error: "Story target not found" });
      return;
    }
    res.status(201).json(story);
  } catch (error) {
    next(error);
  }
});

storyRouter.get("/:id", async (req, res, next) => {
  try {
    const story = await getStoryById(req.params.id);
    if (!story) {
      res.status(404).json({ error: "Story not found" });
      return;
    }
    res.json(story);
  } catch (error) {
    next(error);
  }
});

