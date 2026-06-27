import json
from typing import Any

from openai import AsyncOpenAI

from app.config import settings


async def complete_text(system_prompt: str, user_prompt: str, temperature: float = 0.2) -> str | None:
    if not settings.openai_api_key:
        return None

    client = AsyncOpenAI(api_key=settings.openai_api_key, timeout=20.0)
    try:
        response = await client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
        )
        return response.choices[0].message.content
    except Exception:
        return None


async def complete_json(prompt: str) -> dict[str, Any] | None:
    if not settings.openai_api_key:
        return None

    client = AsyncOpenAI(api_key=settings.openai_api_key, timeout=15.0)
    try:
      response = await client.chat.completions.create(
          model=settings.llm_model,
          messages=[
              {
                  "role": "system",
                  "content": "You are a Vietnamese heritage storytelling assistant. Return strict JSON only."
              },
              {"role": "user", "content": prompt}
          ],
          response_format={"type": "json_object"},
          temperature=0.7
      )
      content = response.choices[0].message.content or "{}"
      return json.loads(content)
    except Exception:
      return None
