import { env } from "../config/env.js";
import type { AgeGroup, ChatMessage, Story, StoryContext } from "../types/index.js";

type AgentStoryResponse = Omit<Story, "id" | "createdAt" | "targetType" | "targetId" | "ageGroup">;

export async function generateStory(context: StoryContext, ageGroup: AgeGroup): Promise<AgentStoryResponse> {
  const response = await fetch(`${env.agentBaseUrl}/story`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      targetType: context.targetType,
      context,
      ageGroup
    })
  });

  if (!response.ok) {
    throw new Error(`Agent story request failed with ${response.status}`);
  }

  return response.json() as Promise<AgentStoryResponse>;
}

export async function chatWithGuide(
  context: StoryContext,
  message: string,
  history: ChatMessage[] = []
): Promise<{ answer: string; suggestions: string[] }> {
  const response = await fetch(`${env.agentBaseUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({ context, message, history })
  });

  if (!response.ok) {
    throw new Error(`Agent chat request failed with ${response.status}`);
  }

  return response.json() as Promise<{ answer: string; suggestions: string[] }>;
}
