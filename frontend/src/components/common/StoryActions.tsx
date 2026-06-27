import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import type { AgeGroup, StoryTargetType } from "../../lib/types";
import { AgeSelector } from "./AgeSelector";

export function StoryActions({ targetType, targetId }: { targetType: StoryTargetType; targetId: string }) {
  const navigate = useNavigate();
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("teens");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateStory() {
    setIsLoading(true);
    setError(null);
    try {
      const story = await api.createStory({ targetType, targetId, ageGroup });
      navigate(`/stories/${story.id}`);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Không thể tạo câu chuyện");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded border border-ink/10 bg-white p-4 shadow-soft">
      <h2 className="text-lg font-semibold">Kể chuyện theo độ tuổi</h2>
      <p className="mt-1 text-sm leading-6 text-ink/65">
        Prompt sẽ đổi giọng kể theo nhóm tuổi, nhưng vẫn dùng cùng context di sản.
      </p>
      <div className="mt-4">
        <AgeSelector value={ageGroup} onChange={setAgeGroup} />
      </div>
      {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
      <button
        type="button"
        onClick={handleCreateStory}
        disabled={isLoading}
        className="mt-4 w-full rounded bg-clay px-4 py-3 text-sm font-semibold text-white transition hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "AI đang kể chuyện..." : "Tạo câu chuyện AI"}
      </button>
    </section>
  );
}

