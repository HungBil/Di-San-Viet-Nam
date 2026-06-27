export type AgeGroup = "kids" | "teens" | "adults";
export type StoryTargetType = "landmark" | "artifact";
export type VoiceProvider = "elevenlabs" | "openai" | "mock";

export type Landmark = {
  id: string;
  name: string;
  slug: string;
  province: string;
  region: "north" | "central" | "south";
  coordinates: { lat: number; lng: number };
  shortDescription: string;
  historySummary: string;
  tourismHighlights: string[];
  imageUrl: string;
  artifactIds: string[];
  tags: string[];
};

export type Artifact = {
  id: string;
  landmarkId?: string;
  name: string;
  slug: string;
  period?: string;
  material?: string;
  shortDescription: string;
  culturalSignificance: string;
  imageUrl: string;
  tags: string[];
};

export type TimelineItem = {
  id: string;
  targetType: StoryTargetType;
  targetId: string;
  yearLabel: string;
  title: string;
  description: string;
  order: number;
};

export type StoryGraph = {
  nodes: {
    id: string;
    label: string;
    type: "place" | "person" | "event" | "artifact" | "idea";
  }[];
  edges: {
    source: string;
    target: string;
    label: string;
  }[];
};

export type Story = {
  id: string;
  targetType: StoryTargetType;
  targetId: string;
  ageGroup: AgeGroup;
  title: string;
  summary: string;
  content: string;
  timeline: TimelineItem[];
  graph: StoryGraph;
  suggestedQuestions: string[];
  createdAt: string;
};

export type LandmarkDetail = Landmark & {
  artifacts: Artifact[];
  timeline: TimelineItem[];
};

export type ArtifactDetail = Artifact & {
  landmark?: Landmark;
  timeline: TimelineItem[];
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type GlbModel = {
  name: string;
  path: string;
  url: string;
  size: number;
};

export type TtsResponse = {
  audioUrl: string | null;
  message: string;
  provider: VoiceProvider;
};

export type SttResponse = {
  text: string;
  provider: VoiceProvider;
};
