import argparse
import asyncio
from pathlib import Path
import shutil
import subprocess

from app.services.guide_service import ask_guide


def _play_audio(path: Path) -> None:
    for command in ("mpg123", "ffplay", "afplay"):
        player = shutil.which(command)
        if not player:
            continue
        args = [player, str(path)]
        if command == "ffplay":
            args = [player, "-nodisp", "-autoexit", str(path)]
        subprocess.run(args, check=False)
        return
    print("Audio player not found. Install mpg123 or ffplay, or open the mp3 file manually.")


async def run_query(
    query: str,
    out_dir: Path,
    voice: str | None,
    play: bool,
    use_llm: bool,
    use_speech: bool,
) -> None:
    answer, audio_path = await ask_guide(query, out_dir, voice, use_llm, use_speech)
    print(f"\nGuide:\n{answer}\n")
    if audio_path:
        print(f"Audio: {audio_path}")
        if play:
            _play_audio(audio_path)
    elif use_speech:
        print("Audio: not generated. Check ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID.")


async def interactive(out_dir: Path, voice: str | None, play: bool, use_llm: bool, use_speech: bool) -> None:
    print("Nhap cau hoi ve an vang Sac menh chi bao hoac Lang Tu Duc. Enter rong de thoat.")
    while True:
        query = input("> ").strip()
        if not query:
            break
        await run_query(query, out_dir, voice, play, use_llm, use_speech)


def main() -> None:
    parser = argparse.ArgumentParser(description="Terminal tour guide with ElevenLabs speech.")
    parser.add_argument("query", nargs="*", help="Question for the guide")
    parser.add_argument("--out-dir", default="outputs", help="Directory for generated mp3 files")
    parser.add_argument("--voice", default=None, help="Optional ElevenLabs voice id")
    parser.add_argument("--no-play", action="store_true", help="Generate audio without playing it")
    parser.add_argument("--text-only", action="store_true", help="Skip ElevenLabs speech generation")
    parser.add_argument("--offline", action="store_true", help="Use only local data, no LLM and no speech")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    query = " ".join(args.query).strip()
    use_llm = not args.offline
    use_speech = not args.offline and not args.text_only
    if query:
        asyncio.run(run_query(query, out_dir, args.voice, not args.no_play, use_llm, use_speech))
    else:
        asyncio.run(interactive(out_dir, args.voice, not args.no_play, use_llm, use_speech))


if __name__ == "__main__":
    main()
