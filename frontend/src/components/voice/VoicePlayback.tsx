import { useState } from "react";

export function VoicePlayback({ text }: { text: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={speak} className="rounded bg-leaf px-4 py-2 text-sm font-semibold text-white">
        {isSpeaking ? "Đang đọc..." : "Text to voice"}
      </button>
      <button type="button" onClick={stop} className="rounded border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/70">
        Dừng
      </button>
    </div>
  );
}

