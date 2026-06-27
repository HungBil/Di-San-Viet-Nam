# Viet Heritage AI

Hackathon MVP for AI-powered Vietnam heritage storytelling.

## Stack

- Frontend: Vite, React, TypeScript, TailwindCSS
- Backend: ExpressJS, TypeScript
- Agent: FastAPI, Python
- Infra: Docker Compose

## Demo Flow

1. Home -> Vietnam Map
2. Click a landmark
3. Choose age group and generate an AI story
4. View timeline and story graph
5. Share the story
6. Open an artifact detail and chat with the guide

## Run With Docker

```bash
docker compose --env-file .env -f infra/dev/docker-compose.yml up --build
```

- Frontend: http://localhost:5173
- Backend health: http://localhost:3000/api/health
- Agent health: http://localhost:8000/health

The agent uses `OPENAI_API_KEY` when present. If the key is missing or the LLM call fails, it returns demo-safe fallback content.

## Local Development

Each service can also run independently:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

```bash
cd agent
python -m venv .venv
.venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload --port 8000
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
