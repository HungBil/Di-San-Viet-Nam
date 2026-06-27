from app.services.llm_service import complete_text


SYSTEM_PROMPT = (
    "Bạn là hướng dẫn viên di sản Việt Nam. "
    "Hãy viết lời thuyết minh tiếng Việt tự nhiên, cô đọng, tối đa 3 câu. "
    "Chỉ nói về di tích, công trình, hiện vật hoặc chi tiết được nhắc tới; nêu mô tả cụ thể và bối cảnh lịch sử hoặc vai trò của nó "
    "Không dùng câu chung chung như 'di tích được nhắc tới', 'điểm đang quan sát', hay 'chi tiết này góp phần'. "
    "Không nhắc đến dự án, ứng dụng, mô hình 3D, người xem, màn hình hoặc trải nghiệm số. "
)


async def generate_annotation_narration(text: str) -> str:
    source_text = _normalize_space(text)
    if not source_text:
        return "Đây là một chi tiết đáng chú ý của di tích."

    generated = await complete_text(
        SYSTEM_PROMPT,
        (
            "Từ thông tin sau, viết lời giới thiệu ngắn để đọc bằng giọng nói. "
            "Giữ tối đa 3 câu, giọng như một hướng dẫn viên đang giới thiệu trực tiếp về di tích. "
            "Nội dung cần có mô tả cụ thể và bối cảnh lịch sử hoặc vai trò của chi tiết đó trong di tích khi có thể. "
            "Không thêm dữ kiện ngoài thông tin gốc; nếu thiếu bối cảnh thì diễn giải từ tên gọi, vị trí và chức năng được cung cấp:\n\n"
            f"{source_text}"
        ),
        temperature=1.0,
    )
    if generated:
        narration = _limit_sentences(_normalize_space(generated), 5)
        if narration and narration != source_text:
            return _ensure_period(narration)

    return fallback_annotation_narration(source_text)


def fallback_annotation_narration(text: str) -> str:
    source_text = _normalize_space(text)
    if not source_text:
        return "Đây là một chi tiết đáng chú ý của di tích."

    labeled_context = _labeled_context(source_text)
    if labeled_context:
        site, title, detail = labeled_context
        return (
            f"Đây là {title}, một điểm trong {site}. "
            f"{_ensure_period(detail)} "
            f"Trong không gian {site}, {title} gợi rõ lối dẫn vào Hòa Khiêm Điện và không khí trang trọng của khu lăng."
        )

    source_sentences = _sentences(source_text)
    if len(source_sentences) == 2:
        title = _strip_terminal_punctuation(source_sentences[0])
        detail = _ensure_period(source_sentences[1])
        context_name = _context_from_detail(detail) or title
        return (
            f"Đây là {title}. "
            f"{detail} "
            f"Trong không gian {context_name}, {title} cho thấy cách tổ chức lối vào và sự trang trọng của khu di tích."
        )

    return _ensure_period(_limit_sentences(source_text, 5))


def _limit_sentences(text: str, limit: int) -> str:
    return " ".join(_sentences(text)[:limit]).strip()


def _sentences(text: str) -> list[str]:
    sentences: list[str] = []
    current: list[str] = []
    for char in text:
        current.append(char)
        if char in ".!?。！？":
            sentence = "".join(current).strip()
            if sentence:
                sentences.append(sentence)
            current = []

    if current:
        sentence = "".join(current).strip()
        if sentence:
            sentences.append(sentence)

    return sentences


def _normalize_space(text: str) -> str:
    return " ".join(text.split())


def _ensure_period(text: str) -> str:
    if not text:
        return text
    return text if text[-1] in ".!?。！？" else f"{text}."


def _strip_terminal_punctuation(text: str) -> str:
    return text.rstrip(".!?。！？").strip()


def _context_from_detail(text: str) -> str | None:
    known_contexts = ["Hòa Khiêm Điện", "Lưu Khiêm", "Tự Đức"]
    for context in known_contexts:
        if context in text:
            return context
    return None


def _labeled_context(text: str) -> tuple[str, str, str] | None:
    sentences = _sentences(text)
    if len(sentences) < 3:
        return None

    site = _label_value(sentences[0], "Di tích:")
    title = _label_value(sentences[1], "Điểm thuyết minh:")
    detail = _strip_terminal_punctuation(" ".join(sentences[2:]))
    if site and title and detail:
        return site, title, detail
    return None


def _label_value(text: str, label: str) -> str | None:
    if not text.startswith(label):
        return None
    return _strip_terminal_punctuation(text[len(label):].strip())
