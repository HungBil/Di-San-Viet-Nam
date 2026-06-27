import { Router } from "express";
import {
  createShare,
  createShareCard,
  getShareCard,
  getShareStory
} from "../services/share.service.js";

export const shareRouter = Router();

shareRouter.post("/card", async (req, res, next) => {
  try {
    const {
      address,
      avatar = "",
      image,
      latitude,
      longitude,
      marker,
      message,
      name,
      summary,
      title
    } = req.body as {
      address?: string;
      avatar?: string;
      image?: string;
      latitude?: number;
      longitude?: number;
      marker?: string;
      message?: string;
      name?: string;
      summary?: string;
      title?: string;
    };
    if (!address || !image || latitude == null || longitude == null || !marker || !message || !name || !summary || !title) {
      res.status(400).json({ error: "address, image, latitude, longitude, marker, message, name, summary and title are required" });
      return;
    }

    const share = await createShareCard({
      address,
      avatar,
      image,
      latitude,
      longitude,
      marker,
      message,
      name,
      summary,
      title
    });
    res.status(201).json(share);
  } catch (error) {
    next(error);
  }
});

shareRouter.get("/card/:shareId", async (req, res, next) => {
  try {
    const card = await getShareCard(req.params.shareId);
    if (!card) {
      res.status(404).json({ error: "Share card not found" });
      return;
    }
    res.json(card);
  } catch (error) {
    next(error);
  }
});

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

