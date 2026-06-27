from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def list_data_files() -> list[str]:
    return sorted(path.name for path in DATA_DIR.glob("*.md"))


def read_data_file(file_name: str) -> str:
    path = (DATA_DIR / file_name).resolve()
    if DATA_DIR.resolve() not in path.parents:
        raise ValueError("Invalid data file path")
    return path.read_text(encoding="utf-8")


def search_data(query: str, limit: int = 5) -> list[dict[str, str | int]]:
    terms = [term.casefold() for term in query.split() if term.strip()]
    hits: list[dict[str, str | int]] = []

    for file_name in list_data_files():
        content = _without_frontmatter(read_data_file(file_name))
        folded = content.casefold()
        score = sum(folded.count(term) for term in terms) if terms else 0
        if not score:
            continue

        index = min((folded.find(term) for term in terms if folded.find(term) >= 0), default=0)
        start = max(index - 160, 0)
        end = min(index + 360, len(content))
        snippet = " ".join(content[start:end].split())
        hits.append({"file": file_name, "score": score, "snippet": snippet})

    return sorted(hits, key=lambda hit: int(hit["score"]), reverse=True)[:limit]


def _without_frontmatter(content: str) -> str:
    if not content.startswith("---"):
        return content
    parts = content.split("---", 2)
    return parts[2].strip() if len(parts) == 3 else content
