import { Router } from "express";
import { env } from "../config/env.js";

export const voiceRouter = Router();

voiceRouter.post("/tts", async (req, res, next) => {
  try {
    const response = await fetch(`${env.agentBaseUrl}/voice/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify(req.body)
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      res.status(response.status).json(body);
      return;
    }

    res.json(body);
  } catch (error) {
    next(error);
  }
});

voiceRouter.post("/stt", async (req, res, next) => {
  try {
    const contentType = req.headers["content-type"];
    if (!contentType?.includes("multipart/form-data")) {
      res.status(400).json({ error: "multipart/form-data is required" });
      return;
    }

    const response = await fetch(`${env.agentBaseUrl}/voice/stt`, {
      method: "POST",
      headers: { "Content-Type": contentType },
      signal: AbortSignal.timeout(60_000),
      body: req as unknown as BodyInit,
      duplex: "half"
    } as RequestInit & { duplex: "half" });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      res.status(response.status).json(body);
      return;
    }

    res.json(body);
  } catch (error) {
    next(error);
  }
});
