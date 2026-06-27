from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chat, health, story, voice

app = FastAPI(title="Viet Heritage AI Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(story.router)
app.include_router(chat.router)
app.include_router(voice.router)

