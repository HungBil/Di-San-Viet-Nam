from fastapi import APIRouter

from app.schemas.ai import SttResponse, TtsRequest, TtsResponse
from app.services.voice_service import speech_to_text, text_to_speech

router = APIRouter(prefix="/voice")


@router.post("/tts", response_model=TtsResponse)
async def tts(payload: TtsRequest) -> TtsResponse:
    return await text_to_speech(payload.text, payload.voice)


@router.post("/stt", response_model=SttResponse)
async def stt() -> SttResponse:
    return await speech_to_text()
