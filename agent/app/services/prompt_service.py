from pathlib import Path
from typing import Any

from app.schemas.ai import AgeGroup, StoryTargetType

PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"


def read_prompt(file_name: str) -> str:
    return (PROMPT_DIR / file_name).read_text(encoding="utf-8")


def age_prompt(age_group: AgeGroup) -> str:
    return read_prompt(f"age_{age_group}.md")


def build_story_prompt(target_type: StoryTargetType, context: dict[str, Any], age_group: AgeGroup) -> str:
    base_prompt = read_prompt("landmark_story.md" if target_type == "landmark" else "artifact_story.md")
    return f"""
{base_prompt}

{age_prompt(age_group)}

Context JSON:
{context}

Return only valid JSON with:
title, summary, content, timeline, graph, suggestedQuestions.
"""


def build_chat_prompt(context: dict[str, Any], message: str) -> str:
    guide_prompt = read_prompt("guide_chat.md")
    return f"""
{guide_prompt}

Context JSON:
{context}

Visitor question:
{message}

Return only valid JSON with:
answer, suggestions.
"""

