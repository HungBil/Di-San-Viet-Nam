from fastapi import APIRouter

from app.schemas.ai import AnnotationNarrationRequest, AnnotationNarrationResponse
from app.services.annotation_narration_service import generate_annotation_narration

router = APIRouter(prefix="/annotation")


@router.post("/narration", response_model=AnnotationNarrationResponse)
async def annotation_narration(payload: AnnotationNarrationRequest) -> AnnotationNarrationResponse:
    return AnnotationNarrationResponse(text=await generate_annotation_narration(payload.text))
