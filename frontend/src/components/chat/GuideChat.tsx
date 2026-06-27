import { FormEvent, useState } from "react";
import { api } from "../../lib/api";
import type { ChatMessage } from "../../lib/types";

export function GuideChat({ artifactId, initialSuggestions = [] }: { artifactId: string; initialSuggestions?: string[] }) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [isLoading, setIsLoading] = useState(false);

  async function send(nextMessage: string) {
    if (!nextMessage.trim()) return;
    const userMessage: ChatMessage = { role: "user", content: nextMessage.trim() };
    const nextHistory = [...history, userMessage];
    setHistory(nextHistory);
    setMessage("");
    setIsLoading(true);
    try {
      const response = await api.chat({ artifactId, message: userMessage.content, history });
      setHistory([...nextHistory, { role: "assistant", content: response.answer }]);
      setSuggestions(response.suggestions);
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(message);
  }

  return (
    <section className="rounded border border-ink/10 bg-white p-4 shadow-soft">
      <h2 className="text-lg font-semibold">Chatbot hướng dẫn viên</h2>
      <div className="mt-4 max-h-72 space-y-3 overflow-auto rounded bg-paper p-3">
        {history.length === 0 ? (
          <p className="text-sm leading-6 text-ink/60">Hỏi về chất liệu, hoa văn, niên đại hoặc ý nghĩa của bảo vật.</p>
        ) : (
          history.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={[
                "rounded px-3 py-2 text-sm leading-6",
                item.role === "user" ? "ml-8 bg-leaf text-white" : "mr-8 bg-white text-ink"
              ].join(" ")}
            >
              {item.content}
            </div>
          ))
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => void send(suggestion)}
            className="rounded border border-ink/10 bg-white px-3 py-2 text-xs text-ink/70 transition hover:border-leaf hover:text-leaf"
          >
            {suggestion}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-w-0 flex-1 rounded border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-leaf"
          placeholder="Nhập câu hỏi..."
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-leaf px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? "..." : "Gửi"}
        </button>
      </form>
    </section>
  );
}

