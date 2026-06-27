from fastapi import APIRouter

from app.schemas.ai import StoryRequest, StoryResponse
from app.services.fallback_service import fallback_story
from app.services.llm_service import complete_json
from app.services.prompt_service import build_story_prompt

router = APIRouter()


@router.post("/story", response_model=StoryResponse)
async def create_story(payload: StoryRequest) -> StoryResponse:
    prompt = build_story_prompt(payload.targetType, payload.context, payload.ageGroup)
    result = await complete_json(prompt)
    if result:
        try:
            return StoryResponse(**result)
        except Exception:
            pass
    return fallback_story(payload.targetType, payload.context, payload.ageGroup)

