from app.schemas.ai import SttResponse, TtsResponse


async def text_to_speech(text: str, voice: str | None = None) -> TtsResponse:
    return TtsResponse(
        audioUrl=None,
        message="Voice is a research/demo placeholder. Text is ready for browser speech synthesis."
    )


async def speech_to_text() -> SttResponse:
    return SttResponse(text="Voice-to-text placeholder for the hackathon research phase.")

