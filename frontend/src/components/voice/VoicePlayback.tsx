import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import type { VoiceProvider } from "../../lib/types";

export function VoicePlayback({ text }: { text: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<VoiceProvider>("elevenlabs");
  const [status, setStatus] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function speak() {
    stop();
    setIsLoading(true);
    setStatus(null);

    try {
      const result = await api.tts({ text, provider });
      setStatus(`${result.provider}: ${result.message}`);
      if (result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          setIsSpeaking(false);
          setStatus("Audio element failed. ElevenLabs audio was not played.");
        };
        setIsSpeaking(true);
        await audio.play();
        return;
      }

      if (provider !== "mock") {
        setIsSpeaking(false);
        return;
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Voice request failed.");
      if (provider !== "mock") {
        return;
      }
    } finally {
      setIsLoading(false);
    }

    speakWithBrowser();
  }

  function speakWithBrowser() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    audioRef.current?.pause();
    audioRef.current = null;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value as VoiceProvider)}
          className="rounded border border-ink/15 px-3 py-2 text-sm font-semibold text-ink/70"
        >
          <option value="elevenlabs">ElevenLabs</option>
          <option value="openai">OpenAI</option>
          <option value="mock">Mock</option>
        </select>
        <button type="button" onClick={speak} className="rounded bg-leaf px-4 py-2 text-sm font-semibold text-white">
          {isLoading ? "Đang tạo giọng..." : isSpeaking ? "Đang đọc..." : "Nghe thử"}
        </button>
        <button type="button" onClick={stop} className="rounded border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/70">
          Dừng
        </button>
      </div>
      {status ? <p className="text-xs leading-5 text-ink/55">{status}</p> : null}
    </div>
  );
}
