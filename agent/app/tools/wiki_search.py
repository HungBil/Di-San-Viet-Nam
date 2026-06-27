import re
from urllib.parse import quote

import httpx


async def wiki_search(query: str, limit: int = 5, language: str = "vi") -> list[dict[str, str]]:
    url = f"https://{language}.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srlimit": limit,
        "format": "json",
        "origin": "*",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()

    results = response.json().get("query", {}).get("search", [])
    return [
        {
            "title": item.get("title", ""),
            "snippet": re.sub(r"<[^>]+>", "", item.get("snippet", "")),
            "url": f"https://{language}.wikipedia.org/wiki/{quote(item.get('title', '').replace(' ', '_'))}",
        }
        for item in results
    ]


async def wiki_summary(title: str, language: str = "vi") -> dict[str, str]:
    url = f"https://{language}.wikipedia.org/api/rest_v1/page/summary/{quote(title)}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        response.raise_for_status()

    data = response.json()
    return {
        "title": data.get("title", ""),
        "extract": data.get("extract", ""),
        "url": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
    }
