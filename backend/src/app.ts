import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { chatRouter } from "./routes/chat.routes.js";
import { contentRouter } from "./routes/content.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { modelRouter } from "./routes/model.routes.js";
import { shareRouter } from "./routes/share.routes.js";
import { storyRouter } from "./routes/story.routes.js";
import { voiceRouter } from "./routes/voice.routes.js";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRouter);
app.use("/api", contentRouter);
app.use("/api", modelRouter);
app.use("/api/stories", storyRouter);
app.use("/api/chat", chatRouter);
app.use("/api/share", shareRouter);
app.use("/api/voice", voiceRouter);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
};

app.use(errorHandler);
