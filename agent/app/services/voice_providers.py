import base64
from typing import Protocol

import httpx

from app.config import settings
from app.schemas.ai import SttResponse, TtsResponse, VoiceProvider


class VoiceProviderClient(Protocol):
    name: VoiceProvider

    async def synthesize(self, text: str, voice: str | None = None) -> TtsResponse:
        ...

    async def transcribe(
        self,
        file_bytes: bytes | None = None,
        filename: str | None = None,
        content_type: str | None = None,
    ) -> SttResponse:
        ...


class MockVoiceProvider:
    name: VoiceProvider = "mock"

    async def synthesize(self, text: str, voice: str | None = None) -> TtsResponse:
        return TtsResponse(
            audioUrl=None,
            message="Voice provider is not configured. Text is ready for browser speech synthesis.",
            provider=self.name,
        )

    async def transcribe(
        self,
        file_bytes: bytes | None = None,
        filename: str | None = None,
        content_type: str | None = None,
    ) -> SttResponse:
        return SttResponse(text="Voice-to-text provider is not configured.", provider=self.name)


class ElevenLabsVoiceProvider:
    name: VoiceProvider = "elevenlabs"
    base_url = "https://api.elevenlabs.io/v1"
    timeout = httpx.Timeout(30.0, connect=5.0)

    async def synthesize(self, text: str, voice: str | None = None) -> TtsResponse:
        if not settings.elevenlabs_api_key:
            return await MockVoiceProvider().synthesize(text, voice)

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                voice_id = await self._resolve_voice_id(client, voice)
                if not voice_id:
                    return TtsResponse(
                        audioUrl=None,
                        message="ElevenLabs voice is not configured and no account voices were found.",
                        provider=self.name,
                    )

                payload = {
                    "text": text,
                    "model_id": settings.elevenlabs_tts_model,
                }
                if settings.elevenlabs_language_code:
                    payload["language_code"] = settings.elevenlabs_language_code

                language_fallback = False
                response = await self._post_tts(client, voice_id, payload)
                if response.status_code == 400 and _is_unsupported_language(response) and "language_code" in payload:
                    payload.pop("language_code", None)
                    language_fallback = True
                    response = await self._post_tts(client, voice_id, payload)
                response.raise_for_status()

            return TtsResponse(
                audioUrl=_data_url(response.content, "audio/mpeg"),
                message=_elevenlabs_success_message(payload, language_fallback),
                provider=self.name,
            )
        except httpx.HTTPStatusError as error:
            detail = error.response.text[:500]
            return TtsResponse(
                audioUrl=None,
                message=f"ElevenLabs TTS failed: {error.response.status_code}: {detail}",
                provider=self.name,
            )
        except Exception as error:
            return TtsResponse(
                audioUrl=None,
                message=f"ElevenLabs TTS failed: {type(error).__name__}: {error}",
                provider=self.name,
            )

    async def _resolve_voice_id(self, client: httpx.AsyncClient, voice: str | None) -> str | None:
        if voice:
            return voice
        if settings.elevenlabs_voice_id:
            return settings.elevenlabs_voice_id

        response = await client.get(
            f"{self.base_url}/voices",
            headers={"xi-api-key": settings.elevenlabs_api_key or ""},
        )
        response.raise_for_status()
        voices = response.json().get("voices", [])
        if not voices:
            return None
        return voices[0].get("voice_id")

    async def _post_tts(self, client: httpx.AsyncClient, voice_id: str, payload: dict[str, str]) -> httpx.Response:
        return await client.post(
            f"{self.base_url}/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": settings.elevenlabs_api_key,
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
            },
            json=payload,
        )

    async def transcribe(
        self,
        file_bytes: bytes | None = None,
        filename: str | None = None,
        content_type: str | None = None,
    ) -> SttResponse:
        if not settings.elevenlabs_api_key or not file_bytes:
            return await MockVoiceProvider().transcribe(file_bytes, filename, content_type)

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=5.0)) as client:
                response = await client.post(
                    f"{self.base_url}/speech-to-text",
                    headers={"xi-api-key": settings.elevenlabs_api_key},
                    data={"model_id": settings.elevenlabs_stt_model},
                    files={
                        "file": (
                            filename or "audio.webm",
                            file_bytes,
                            content_type or "application/octet-stream",
                        )
                    },
                )
                response.raise_for_status()

            payload = response.json()
            return SttResponse(text=str(payload.get("text", "")), provider=self.name)
        except Exception:
            return SttResponse(text="", provider=self.name)


class OpenAIVoiceProvider:
    name: VoiceProvider = "openai"
    base_url = "https://api.openai.com/v1"

    async def synthesize(self, text: str, voice: str | None = None) -> TtsResponse:
        if not settings.openai_api_key:
            return await MockVoiceProvider().synthesize(text, voice)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/audio/speech",
                    headers={
                        "Authorization": f"Bearer {settings.openai_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.openai_tts_model,
                        "voice": voice or settings.openai_tts_voice,
                        "input": text,
                        "response_format": "mp3",
                    },
                )
                response.raise_for_status()

            return TtsResponse(
                audioUrl=_data_url(response.content, "audio/mpeg"),
                message="Generated by openai",
                provider=self.name,
            )
        except Exception:
            return TtsResponse(
                audioUrl=None,
                message="OpenAI TTS failed. Text is ready for browser speech synthesis.",
                provider=self.name,
            )

    async def transcribe(
        self,
        file_bytes: bytes | None = None,
        filename: str | None = None,
        content_type: str | None = None,
    ) -> SttResponse:
        if not settings.openai_api_key or not file_bytes:
            return await MockVoiceProvider().transcribe(file_bytes, filename, content_type)

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/audio/transcriptions",
                    headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                    data={"model": settings.openai_stt_model},
                    files={
                        "file": (
                            filename or "audio.webm",
                            file_bytes,
                            content_type or "application/octet-stream",
                        )
                    },
                )
                response.raise_for_status()

            payload = response.json()
            return SttResponse(text=str(payload.get("text", "")), provider=self.name)
        except Exception:
            return SttResponse(text="", provider=self.name)


def get_voice_provider(provider: VoiceProvider | None = None) -> VoiceProviderClient:
    selected = provider or _normalized_default_provider()
    if selected == "elevenlabs":
        return ElevenLabsVoiceProvider()
    if selected == "openai":
        return OpenAIVoiceProvider()
    return MockVoiceProvider()


def _normalized_default_provider() -> VoiceProvider:
    if settings.voice_provider in {"elevenlabs", "openai", "mock"}:
        return settings.voice_provider  # type: ignore[return-value]
    return "mock"


def _is_unsupported_language(response: httpx.Response) -> bool:
    try:
        detail = response.json().get("detail", {})
    except ValueError:
        return False
    return detail.get("status") == "unsupported_language" or detail.get("param") == "language_code"


def _elevenlabs_success_message(payload: dict[str, str], language_fallback: bool) -> str:
    details = [f"model={payload['model_id']}"]
    if language_code := payload.get("language_code"):
        details.append(f"language_code={language_code}")
    if language_fallback:
        details.append("language_code_fallback=true")
    return f"Generated by elevenlabs ({', '.join(details)})"


def _data_url(content: bytes, mime_type: str) -> str:
    encoded = base64.b64encode(content).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"
