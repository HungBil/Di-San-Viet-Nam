import unittest
from unittest.mock import AsyncMock, patch

from app.services.annotation_narration_service import (
    fallback_annotation_narration,
    generate_annotation_narration,
)


class AnnotationNarrationServiceTest(unittest.TestCase):
    def test_fallback_annotation_narration_is_at_most_five_sentences(self):
        text = (
            "Mat an. Hinh vuong, duc noi 4 chu Han. "
            "Quai an tao hinh rong cuon. "
            "Dong lac khoan ghi trong luong va chat lieu. "
            "Chi tiet nay nam tren mo hinh 3D. "
            "Nguoi xem co the quan sat gan hon."
        )

        narration = fallback_annotation_narration(text)
        sentence_count = sum(1 for part in narration.split(".") if part.strip())

        self.assertLessEqual(sentence_count, 5)
        self.assertIn("Mat an", narration)
        self.assertTrue(narration.endswith("."))

    def test_fallback_annotation_narration_rephrases_short_title_and_body(self):
        text = "Khiêm Cung Môn. Cổng dẫn vào sân trước Hòa Khiêm Điện."

        narration = fallback_annotation_narration(text)

        self.assertNotEqual(narration, text)
        self.assertIn("Đây là Khiêm Cung Môn", narration)
        self.assertIn("Cổng dẫn vào sân trước Hòa Khiêm Điện", narration)
        self.assertLessEqual(sum(1 for part in narration.split(".") if part.strip()), 3)

    def test_fallback_annotation_narration_does_not_mention_project_or_3d(self):
        text = "Khiêm Cung Môn. Cổng dẫn vào sân trước Hòa Khiêm Điện."

        narration = fallback_annotation_narration(text).lower()

        for forbidden in [
            "3d",
            "mô hình",
            "dự án",
            "người xem",
            "điểm đang quan sát",
            "di tích được nhắc tới",
            "chi tiết này góp phần",
        ]:
            self.assertNotIn(forbidden, narration)

    def test_fallback_annotation_narration_describes_specific_site(self):
        text = "Khiêm Cung Môn. Cổng dẫn vào sân trước Hòa Khiêm Điện."

        narration = fallback_annotation_narration(text)

        self.assertIn("Khiêm Cung Môn", narration)
        self.assertIn("Cổng", narration)
        self.assertIn("Hòa Khiêm Điện", narration)
        self.assertIn("không gian", narration.lower())

    def test_fallback_annotation_narration_uses_site_context_when_provided(self):
        text = (
            "Di tích: Lăng vua Tự Đức - khu Hòa Khiêm. "
            "Điểm thuyết minh: Khiêm Cung Môn. "
            "Cổng dẫn vào sân trước Hòa Khiêm Điện."
        )

        narration = fallback_annotation_narration(text)

        self.assertIn("Khiêm Cung Môn", narration)
        self.assertIn("Lăng vua Tự Đức - khu Hòa Khiêm", narration)
        self.assertIn("Hòa Khiêm Điện", narration)
        self.assertNotIn("Di tích:", narration)
        self.assertNotIn("Điểm thuyết minh:", narration)

class GenerateAnnotationNarrationTest(unittest.IsolatedAsyncioTestCase):
    async def test_generate_annotation_narration_rephrases_when_llm_returns_source(self):
        text = "Khiêm Cung Môn. Cổng dẫn vào sân trước Hòa Khiêm Điện."

        with patch(
            "app.services.annotation_narration_service.complete_text",
            return_value=text,
        ):
            narration = await generate_annotation_narration(text)

        self.assertNotEqual(narration, text)
        self.assertIn("Đây là Khiêm Cung Môn", narration)

    async def test_generate_annotation_narration_accepts_llm_output_without_guarding_terms(self):
        text = "Khiêm Cung Môn. Cổng dẫn vào sân trước Hòa Khiêm Điện."
        generated = "Khiêm Cung Môn là một công trình kiến trúc dẫn vào Hòa Khiêm Điện."

        with patch(
            "app.services.annotation_narration_service.complete_text",
            return_value=generated,
        ):
            narration = await generate_annotation_narration(text)

        self.assertEqual(narration, generated)

    async def test_generate_annotation_narration_uses_temperature_one(self):
        text = "Khiêm Cung Môn. Cổng dẫn vào sân trước Hòa Khiêm Điện."
        complete_text = AsyncMock(return_value="Đây là Khiêm Cung Môn. Cổng dẫn vào sân trước Hòa Khiêm Điện.")

        with patch("app.services.annotation_narration_service.complete_text", complete_text):
            await generate_annotation_narration(text)

        self.assertEqual(complete_text.call_args.kwargs["temperature"], 1.0)


if __name__ == "__main__":
    unittest.main()
