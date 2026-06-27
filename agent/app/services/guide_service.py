import base64
import re
from datetime import datetime
from pathlib import Path

from app.schemas.ai import TtsResponse
from app.services.llm_service import complete_text
from app.services.voice_service import text_to_speech
from app.tools.local_data import read_data_file, search_data

SYSTEM_PROMPT = """
Role: You are a Vietnamese heritage tour guide for Viet Heritage AI.
Persona:
- You speak like a real on-site guide: attentive, observant, and confident.
- You are warm and conversational, but never exaggerated or theatrical.
- You help visitors notice concrete details: material, shape, place, date, function, symbol, and historical context.
- You create a sense of being present at the site or object, using short spoken sentences and natural transitions.

Knowledge scope:
- Use only the supplied context from local heritage documents.
- Do not add dates, names, locations, architecture details, or historical claims that are not present in the context.
- If the context is not enough, say what is not confirmed and guide the visitor to what is known.

Answer structure:
1. Open with a direct answer to the visitor's question.
2. Explain 2-3 important facts in a natural guide voice.
3. End with one memorable observation or viewing suggestion.

Style:
- Vietnamese only.
- Speech-friendly, about 90-160 Vietnamese words.
- Clear, focused, and easy to listen to.
- Avoid bullet points, markdown, citations, and academic phrasing.
""".strip()


async def answer_as_guide(query: str, use_llm: bool = True) -> str:
    hits = _search_context(query)
    context = _build_context(hits)
    if not context:
        context = "No matching local document context found."

    prompt = f"""
Visitor query:
{query}

Local document context:
{context}

Return only the guide answer in Vietnamese.
""".strip()

    if use_llm:
        answer = await complete_text(SYSTEM_PROMPT, prompt)
        if answer:
            return answer.strip()

    return _fallback_answer(query, hits)


def _build_context(hits: list[dict[str, str | int]]) -> str:
    files = []
    for hit in hits:
        file_name = str(hit["file"])
        if file_name not in files:
            files.append(file_name)

    chunks = []
    for file_name in files[:2]:
        content = read_data_file(file_name)
        if content.startswith("---"):
            content = content.split("---", 2)[-1].strip()
        chunks.append(f"Source: {file_name}\n{content[:6000]}")
    return "\n\n".join(chunks) or "No matching local document context found."


def _search_context(query: str) -> list[dict[str, str | int]]:
    hits = search_data(query, limit=4)
    if hits:
        return hits

    folded = query.casefold()
    if "ấn" in folded or "sắc" in folded or "vang" in folded or "vàng" in folded:
        return search_data("Sắc mệnh chi bảo Minh Mệnh 1827", limit=4)
    if "lăng" in folded or "tự đức" in folded or "khiêm" in folded or "hue" in folded or "huế" in folded:
        return search_data("Lăng Tự Đức Khiêm Lăng Huế", limit=4)
    return []


async def speak_guide_answer(answer: str, out_dir: Path, voice: str | None = None) -> Path | None:
    result = await text_to_speech(answer, voice=voice, provider="elevenlabs")
    return _write_audio(result, out_dir)


async def ask_guide(
    query: str,
    out_dir: Path,
    voice: str | None = None,
    use_llm: bool = True,
    use_speech: bool = True,
) -> tuple[str, Path | None]:
    answer = await answer_as_guide(query, use_llm)
    audio_path = await speak_guide_answer(answer, out_dir, voice) if use_speech else None
    return answer, audio_path


def _fallback_answer(query: str, hits: list[dict[str, str | int]]) -> str:
    if not hits:
        return (
            "Tôi chưa tìm thấy đoạn tư liệu phù hợp trong nguồn local. "
            f"Với câu hỏi '{query}', bạn nên thử hỏi cụ thể hơn về ấn Sắc mệnh chi bảo hoặc Lăng Tự Đức."
        )

    snippet = re.sub(r"#+\s*", "", str(hits[0]["snippet"])).strip()
    return (
        "Dựa trên tư liệu local hiện có, điểm chính cần chú ý là: "
        f"{snippet[:520].strip()}..."
    )


def _write_audio(result: TtsResponse, out_dir: Path) -> Path | None:
    if not result.audioUrl or not result.audioUrl.startswith("data:audio/"):
        return None

    out_dir.mkdir(parents=True, exist_ok=True)
    encoded = result.audioUrl.split(",", 1)[1]
    audio = base64.b64decode(encoded)
    path = out_dir / f"guide_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"
    path.write_bytes(audio)
    return path
