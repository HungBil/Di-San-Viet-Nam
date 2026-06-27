export type AgeGroup = "kids" | "teens" | "adults";
export type StoryTargetType = "landmark" | "artifact";
export type Region = "north" | "central" | "south";
export type GraphNodeType = "place" | "person" | "event" | "artifact" | "idea";

export type Landmark = {
  id: string;
  name: string;
  slug: string;
  province: string;
  region: Region;
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
    type: GraphNodeType;
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

export type ShareRecord = {
  id: string;
  storyId: string;
  createdAt: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type StoryContext = {
  targetType: StoryTargetType;
  target: Landmark | Artifact;
  landmark?: Landmark;
  artifacts?: Artifact[];
  timeline: TimelineItem[];
  graph: StoryGraph;
};

