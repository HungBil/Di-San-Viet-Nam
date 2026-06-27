import { Router } from "express";
import { getArtifactById, getArtifacts, getLandmarkById, getLandmarks } from "../services/content.service.js";

export const contentRouter = Router();

contentRouter.get("/landmarks", async (_req, res, next) => {
  try {
    res.json(await getLandmarks());
  } catch (error) {
    next(error);
  }
});

contentRouter.get("/landmarks/:id", async (req, res, next) => {
  try {
    const landmark = await getLandmarkById(req.params.id);
    if (!landmark) {
      res.status(404).json({ error: "Landmark not found" });
      return;
    }
    res.json(landmark);
  } catch (error) {
    next(error);
  }
});

contentRouter.get("/artifacts", async (req, res, next) => {
  try {
    const landmarkId = typeof req.query.landmarkId === "string" ? req.query.landmarkId : undefined;
    res.json(await getArtifacts(landmarkId));
  } catch (error) {
    next(error);
  }
});

contentRouter.get("/artifacts/:id", async (req, res, next) => {
  try {
    const artifact = await getArtifactById(req.params.id);
    if (!artifact) {
      res.status(404).json({ error: "Artifact not found" });
      return;
    }
    res.json(artifact);
  } catch (error) {
    next(error);
  }
});

