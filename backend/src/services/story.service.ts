import { randomUUID } from "node:crypto";
import { readJson, writeJson } from "../repositories/mock.repository.js";
import { generateStory } from "./agent.service.js";
import { buildStoryContext } from "./content.service.js";
import type { AgeGroup, Story, StoryTargetType } from "../types/index.js";

export async function createStory(targetType: StoryTargetType, targetId: string, ageGroup: AgeGroup): Promise<Story | null> {
  const context = await buildStoryContext(targetType, targetId);
  if (!context) return null;

  const aiStory = await generateStory(context, ageGroup);
  const story: Story = {
    id: randomUUID(),
    targetType,
    targetId,
    ageGroup,
    title: aiStory.title,
    summary: aiStory.summary,
    content: aiStory.content,
    timeline: aiStory.timeline.length > 0 ? aiStory.timeline : context.timeline,
    graph: aiStory.graph.nodes.length > 0 ? aiStory.graph : context.graph,
    suggestedQuestions: aiStory.suggestedQuestions,
    createdAt: new Date().toISOString()
  };

  const stories = await readJson<Story[]>("stories.json", []);
  await writeJson("stories.json", [story, ...stories]);
  return story;
}

export async function getStoryById(id: string): Promise<Story | null> {
  const stories = await readJson<Story[]>("stories.json", []);
  return stories.find((story) => story.id === id) ?? null;
}

