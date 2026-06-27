from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.ai import SttResponse, TtsRequest, TtsResponse, VoiceProvider
from app.services.voice_service import speech_to_text, text_to_speech

router = APIRouter(prefix="/voice")


@router.post("/tts", response_model=TtsResponse)
async def tts(payload: TtsRequest) -> TtsResponse:
    return await text_to_speech(payload.text, payload.voice, payload.provider)


@router.post("/stt", response_model=SttResponse)
async def stt(file: UploadFile = File(...), provider: VoiceProvider | None = Form(None)) -> SttResponse:
    file_bytes = await file.read()
    return await speech_to_text(file_bytes, file.filename, file.content_type, provider)
