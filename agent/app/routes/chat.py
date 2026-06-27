from fastapi import APIRouter, HTTPException

from app.schemas.ai import ChatRequest, ChatResponse
from app.services.llm_service import complete_json
from app.services.prompt_service import build_chat_prompt

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    prompt = build_chat_prompt(payload.context, payload.message)
    result = await complete_json(prompt)
    if not result:
        raise HTTPException(status_code=502, detail="LLM did not return a valid chat response.")
    try:
        return ChatResponse(**result)
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"LLM chat response schema is invalid: {error}") from error
