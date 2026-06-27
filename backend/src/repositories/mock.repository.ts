import { promises as fs } from "node:fs";
import path from "node:path";

const dataDir = path.resolve(process.cwd(), "src", "data");

export async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(dataDir, fileName), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    return fallback;
  }
}

export async function writeJson<T>(fileName: string, data: T): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(path.join(dataDir, fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

