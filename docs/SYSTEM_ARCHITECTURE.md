# System Architecture

## Tổng Quan

Di Sản Việt Nam gồm ba service chính:

- Frontend React: giao diện, bản đồ, story UI, 3D viewer.
- Backend Express: API trung tâm, đọc dữ liệu runtime, quản lý story/share/model route.
- FastAPI Agent: sinh story, chat và voice dựa trên context.

```mermaid
flowchart LR
  User[Người dùng] --> FE[Frontend React]
  FE --> BE[Backend Express API]
  BE --> JSON[(Runtime JSON data)]
  BE --> GLB[(GLB model files)]
  BE --> Agent[FastAPI AI Agent]
  Agent --> OpenAI[OpenAI API nếu cấu hình]
  Agent --> Fallback[Fallback content]
  FE --> Three[Three.js Viewer]
```

## Component Responsibilities

| Component | Trách nhiệm |
| --- | --- |
| Frontend | Render UI, điều hướng, gọi API, hiển thị map/story/3D/chat/voice |
| Backend | Validate request, đọc dữ liệu, dựng context, gọi agent, lưu story/share JSON |
| Agent | Prompting, gọi LLM nếu có, parse JSON response, fallback khi lỗi |
| Runtime JSON | Dữ liệu địa danh, hiện vật, timeline, graph, story/share |
| GLB Models | Tài sản 3D phục vụ viewer |

## Story Generation Flow

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant BE as Backend
  participant AG as Agent
  participant LLM as OpenAI/Fallback

  U->>FE: Chọn target + age group
  FE->>BE: POST /api/stories
  BE->>BE: buildStoryContext()
  BE->>AG: POST /story với context
  AG->>LLM: complete_json(prompt)
  LLM-->>AG: JSON hoặc lỗi
  AG-->>BE: StoryResponse
  BE->>BE: Lưu story
  BE-->>FE: Story
  FE-->>U: Story + timeline + graph + voice/share actions
```

## 3D Model Flow

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant BE as Backend
  participant FS as Model Files

  U->>FE: Mở 3D viewer
  FE->>BE: GET /api/models
  BE->>FS: Scan .glb files
  BE-->>FE: Model list
  FE->>BE: GET /api/models/:file
  BE-->>FE: GLB file
  FE->>FE: GLTFLoader + DRACOLoader render model
```

## Data Flow

```mermaid
flowchart TD
  Landmarks[landmarks.json] --> Context[Story context]
  Artifacts[artifacts.json] --> Context
  Timelines[timelines.json] --> Context
  Graphs[graphs.json] --> Context
  Context --> AgentPrompt[Agent prompt]
  AgentPrompt --> Story[Story JSON]
  Story --> Stories[stories.json]
  Story --> Share[share link]
```

## Trust Boundaries

- Browser input is untrusted; backend validates target type, target id and age group.
- Agent output is untrusted until parsed into schema.
- AI content is demo content unless backed by verified sources.
- GLB filenames are normalized with `path.basename` before serving.

## Failure Handling

- Missing target: backend returns `404`.
- Invalid story request: backend returns `400`.
- Agent/LLM failure: agent returns fallback story/chat.
- 3D load failure: frontend shows model error state.
