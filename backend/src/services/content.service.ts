import { readJson } from "../repositories/mock.repository.js";
import type { Artifact, Landmark, StoryContext, StoryGraph, StoryTargetType, TimelineItem } from "../types/index.js";

const emptyGraph: StoryGraph = { nodes: [], edges: [] };

export async function getLandmarks(): Promise<Landmark[]> {
  return readJson<Landmark[]>("landmarks.json", []);
}

export async function getArtifacts(landmarkId?: string): Promise<Artifact[]> {
  const artifacts = await readJson<Artifact[]>("artifacts.json", []);
  return landmarkId ? artifacts.filter((artifact) => artifact.landmarkId === landmarkId) : artifacts;
}

export async function getLandmarkById(id: string): Promise<(Landmark & { artifacts: Artifact[]; timeline: TimelineItem[] }) | null> {
  const [landmarks, artifacts, timelines] = await Promise.all([
    getLandmarks(),
    getArtifacts(),
    getTimelines("landmark", id)
  ]);
  const landmark = landmarks.find((item) => item.id === id);
  if (!landmark) return null;
  return {
    ...landmark,
    artifacts: artifacts.filter((artifact) => landmark.artifactIds.includes(artifact.id)),
    timeline: timelines
  };
}

export async function getArtifactById(id: string): Promise<(Artifact & { landmark?: Landmark; timeline: TimelineItem[] }) | null> {
  const [artifacts, landmarks, timelines] = await Promise.all([
    getArtifacts(),
    getLandmarks(),
    getTimelines("artifact", id)
  ]);
  const artifact = artifacts.find((item) => item.id === id);
  if (!artifact) return null;
  return {
    ...artifact,
    landmark: landmarks.find((landmark) => landmark.id === artifact.landmarkId),
    timeline: timelines
  };
}

export async function getTimelines(targetType?: StoryTargetType, targetId?: string): Promise<TimelineItem[]> {
  const timelines = await readJson<TimelineItem[]>("timelines.json", []);
  return timelines
    .filter((item) => (targetType ? item.targetType === targetType : true))
    .filter((item) => (targetId ? item.targetId === targetId : true))
    .sort((a, b) => a.order - b.order);
}

export async function getGraph(targetType: StoryTargetType, targetId: string): Promise<StoryGraph> {
  const graphs = await readJson<Record<string, StoryGraph>>("graphs.json", {});
  return graphs[`${targetType}:${targetId}`] ?? emptyGraph;
}

export async function buildStoryContext(targetType: StoryTargetType, targetId: string): Promise<StoryContext | null> {
  const [timeline, graph] = await Promise.all([getTimelines(targetType, targetId), getGraph(targetType, targetId)]);

  if (targetType === "landmark") {
    const detail = await getLandmarkById(targetId);
    if (!detail) return null;
    return {
      targetType,
      target: detail,
      artifacts: detail.artifacts,
      timeline,
      graph
    };
  }

  const detail = await getArtifactById(targetId);
  if (!detail) return null;
  return {
    targetType,
    target: detail,
    landmark: detail.landmark,
    timeline,
    graph
  };
}

