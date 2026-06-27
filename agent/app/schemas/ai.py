from typing import Any, Literal

from pydantic import BaseModel, Field


AgeGroup = Literal["kids", "teens", "adults"]
StoryTargetType = Literal["landmark", "artifact"]
VoiceProvider = Literal["elevenlabs", "openai", "mock"]


class TimelineItem(BaseModel):
    id: str
    targetType: StoryTargetType
    targetId: str
    yearLabel: str
    title: str
    description: str
    order: int


class StoryGraphNode(BaseModel):
    id: str
    label: str
    type: Literal["place", "person", "event", "artifact", "idea"]


class StoryGraphEdge(BaseModel):
    source: str
    target: str
    label: str


class StoryGraph(BaseModel):
    nodes: list[StoryGraphNode] = Field(default_factory=list)
    edges: list[StoryGraphEdge] = Field(default_factory=list)


class StoryRequest(BaseModel):
    targetType: StoryTargetType
    context: dict[str, Any]
    ageGroup: AgeGroup


class StoryResponse(BaseModel):
    title: str
    summary: str
    content: str
    timeline: list[TimelineItem] = Field(default_factory=list)
    graph: StoryGraph = Field(default_factory=StoryGraph)
    suggestedQuestions: list[str] = Field(default_factory=list)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    context: dict[str, Any]
    message: str
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    suggestions: list[str] = Field(default_factory=list)


class AnnotationNarrationRequest(BaseModel):
    text: str


class AnnotationNarrationResponse(BaseModel):
    text: str


class TtsRequest(BaseModel):
    text: str
    voice: str | None = None
    provider: VoiceProvider | None = None


class TtsResponse(BaseModel):
    audioUrl: str | None = None
    message: str
    provider: VoiceProvider = "mock"


class SttResponse(BaseModel):
    text: str
    provider: VoiceProvider = "mock"
