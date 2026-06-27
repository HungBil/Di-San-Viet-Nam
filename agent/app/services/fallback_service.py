from typing import Any

from app.schemas.ai import AgeGroup, ChatResponse, StoryGraph, StoryResponse, StoryTargetType


def _target_name(context: dict[str, Any]) -> str:
    target = context.get("target", {})
    return target.get("name", "di sản Việt Nam")


def fallback_story(target_type: StoryTargetType, context: dict[str, Any], age_group: AgeGroup) -> StoryResponse:
    name = _target_name(context)
    target = context.get("target", {})
    timeline = context.get("timeline", [])
    graph = context.get("graph", {"nodes": [], "edges": []})
    age_line = {
        "kids": "Câu chuyện được kể như một chuyến phiêu lưu ngắn, dễ hiểu và nhiều hình ảnh.",
        "teens": "Câu chuyện giữ nhịp nhanh hơn, có câu hỏi gợi mở và liên hệ với hiện tại.",
        "adults": "Câu chuyện đi sâu vào bối cảnh lịch sử, biểu tượng văn hóa và giá trị bảo tồn."
    }[age_group]
    kind = "địa danh" if target_type == "landmark" else "bảo vật"
    highlight = target.get("historySummary") or target.get("culturalSignificance") or target.get("shortDescription", "")

    return StoryResponse(
        title=f"Hành trình của {name}",
        summary=f"Một câu chuyện demo về {kind} {name}, kết nối ký ức văn hóa với trải nghiệm du lịch hôm nay.",
        content=(
            f"Khi đứng trước {name}, người xem không chỉ nhìn thấy một {kind}. "
            f"Họ đang bước vào một lớp ký ức của Việt Nam. {highlight} "
            f"{age_line} Nếu lắng nghe kỹ, ta có thể thấy mỗi chi tiết nhỏ đều đang kể về con người, "
            "về bàn tay gìn giữ và về lý do di sản vẫn còn chạm được tới du khách hôm nay."
        ),
        timeline=timeline,
        graph=StoryGraph(**graph),
        suggestedQuestions=[
            f"Điều gì làm {name} đặc biệt?",
            "Câu chuyện này liên quan gì tới đời sống hôm nay?",
            "Nếu chỉ có 10 phút tham quan thì nên chú ý điểm nào?"
        ]
    )


def fallback_chat(context: dict[str, Any], message: str) -> ChatResponse:
    name = _target_name(context)
    target = context.get("target", {})
    significance = target.get("culturalSignificance") or target.get("shortDescription", "")
    return ChatResponse(
        answer=(
            f"Với vai trò hướng dẫn viên, mình sẽ bắt đầu từ {name}. "
            f"{significance} Với câu hỏi của bạn: '{message}', cách nhìn nhanh là hãy chú ý chất liệu, "
            "hoa văn, niên đại và câu chuyện cộng đồng phía sau hiện vật."
        ),
        suggestions=[
            "Hiện vật này dùng trong dịp nào?",
            "Chi tiết nào đáng quan sát nhất?",
            "Trẻ em nên hiểu bảo vật này như thế nào?"
        ]
    )

