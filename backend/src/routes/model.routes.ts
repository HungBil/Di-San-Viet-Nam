import { promises as fs } from "node:fs";
import path from "node:path";
import { Router } from "express";

export type GlbModel = {
  name: string;
  path: string;
  url: string;
  size: number;
};

export const modelDir = path.resolve(process.cwd(), "..");
export const modelRouter = Router();

modelRouter.get("/models", async (_req, res, next) => {
  try {
    res.json((await findGlbModels()).sort((a, b) => a.name.localeCompare(b.name, "vi")));
  } catch (error) {
    next(error);
  }
});

modelRouter.get("/models/:file", async (req, res) => {
  const file = path.basename(req.params.file);
  if (!file.toLowerCase().endsWith(".glb")) {
    res.status(404).json({ error: "Model not found" });
    return;
  }
  res.sendFile(path.join(modelDir, file));
});

async function findGlbModels(): Promise<GlbModel[]> {
  const entries = await fs.readdir(modelDir, { withFileTypes: true });
  const models = await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".glb")) return null;
      const { size } = await fs.stat(path.join(modelDir, entry.name));
      return {
        name: entry.name.replace(/[-_]?compressed\.glb$/i, "").replace(/\.glb$/i, "").replaceAll("_", " "),
        path: entry.name,
        url: `/api/models/${encodeURIComponent(entry.name)}`,
        size
      };
    })
  );

  return models.filter((model): model is GlbModel => Boolean(model));
}
