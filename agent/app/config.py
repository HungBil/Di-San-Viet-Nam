import os
from pathlib import Path

from dotenv import load_dotenv

for parent in Path(__file__).resolve().parents:
    load_dotenv(parent / ".env", override=True)


class Settings:
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    llm_model: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    voice_provider: str = os.getenv("VOICE_PROVIDER", "mock")
    elevenlabs_api_key: str | None = os.getenv("ELEVENLABS_API_KEY")
    elevenlabs_voice_id: str | None = os.getenv("ELEVENLABS_VOICE_ID")
    elevenlabs_tts_model: str = os.getenv("ELEVENLABS_TTS_MODEL", "eleven_multilingual_v2")
    elevenlabs_stt_model: str = os.getenv("ELEVENLABS_STT_MODEL", "scribe_v2")
    elevenlabs_language_code: str | None = os.getenv("ELEVENLABS_LANGUAGE_CODE")
    openai_tts_model: str = os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
    openai_stt_model: str = os.getenv("OPENAI_STT_MODEL", "gpt-4o-transcribe")
    openai_tts_voice: str = os.getenv("OPENAI_TTS_VOICE", "alloy")
    port: int = int(os.getenv("PORT", os.getenv("AGENT_PORT", "8000")))


settings = Settings()
