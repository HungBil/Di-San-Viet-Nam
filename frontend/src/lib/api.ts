import type { AgeGroup, Artifact, ArtifactDetail, ChatMessage, Landmark, LandmarkDetail, Story, StoryTargetType } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  landmarks: () => request<Landmark[]>("/api/landmarks"),
  landmark: (id: string) => request<LandmarkDetail>(`/api/landmarks/${id}`),
  artifacts: (landmarkId?: string) => {
    const query = landmarkId ? `?landmarkId=${encodeURIComponent(landmarkId)}` : "";
    return request<Artifact[]>(`/api/artifacts${query}`);
  },
  artifact: (id: string) => request<ArtifactDetail>(`/api/artifacts/${id}`),
  createStory: (payload: { targetType: StoryTargetType; targetId: string; ageGroup: AgeGroup }) =>
    request<Story>("/api/stories", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  story: (id: string) => request<Story>(`/api/stories/${id}`),
  chat: (payload: { artifactId: string; message: string; history?: ChatMessage[] }) =>
    request<{ answer: string; suggestions: string[] }>("/api/chat", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  share: (storyId: string) =>
    request<{ shareId: string; url: string }>("/api/share", {
      method: "POST",
      body: JSON.stringify({ storyId })
    }),
  shareStory: (shareId: string) => request<Story & { shareId: string }>(`/api/share/${shareId}`)
};

