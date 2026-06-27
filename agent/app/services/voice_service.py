from app.schemas.ai import SttResponse, TtsResponse, VoiceProvider
from app.services.voice_providers import get_voice_provider


async def text_to_speech(text: str, voice: str | None = None, provider: VoiceProvider | None = None) -> TtsResponse:
    voice_provider = get_voice_provider(provider)
    return await voice_provider.synthesize(text, voice)


async def speech_to_text(
    file_bytes: bytes | None = None,
    filename: str | None = None,
    content_type: str | None = None,
    provider: VoiceProvider | None = None,
) -> SttResponse:
    voice_provider = get_voice_provider(provider)
    return await voice_provider.transcribe(file_bytes, filename, content_type)
