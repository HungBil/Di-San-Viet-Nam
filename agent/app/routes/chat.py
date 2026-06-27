from fastapi import APIRouter

from app.schemas.ai import ChatRequest, ChatResponse
from app.services.fallback_service import fallback_chat
from app.services.llm_service import complete_json
from app.services.prompt_service import build_chat_prompt

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    prompt = build_chat_prompt(payload.context, payload.message)
    result = await complete_json(prompt)
    if result:
        try:
            return ChatResponse(**result)
        except Exception:
            pass
    return fallback_chat(payload.context, payload.message)

