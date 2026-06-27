import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { readJson, writeJson } from "../repositories/mock.repository.js";
import { getStoryById } from "./story.service.js";
import type { ShareRecord, Story } from "../types/index.js";

export async function createShare(storyId: string): Promise<{ shareId: string; url: string } | null> {
  const story = await getStoryById(storyId);
  if (!story) return null;

  const shares = await readJson<ShareRecord[]>("shares.json", []);
  const existing = shares.find((share) => share.storyId === storyId);
  const share = existing ?? { id: randomUUID(), storyId, createdAt: new Date().toISOString() };

  if (!existing) {
    await writeJson("shares.json", [share, ...shares]);
  }

  return {
    shareId: share.id,
    url: `${env.appPublicUrl}/share/${share.id}`
  };
}

export async function getShareStory(shareId: string): Promise<(Story & { shareId: string }) | null> {
  const shares = await readJson<ShareRecord[]>("shares.json", []);
  const share = shares.find((item) => item.id === shareId);
  if (!share) return null;

  const story = await getStoryById(share.storyId);
  return story ? { ...story, shareId } : null;
}

