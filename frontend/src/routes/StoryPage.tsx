import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StoryGraphView } from "../components/graph/StoryGraphView";
import { ErrorState, LoadingState } from "../components/common/Status";
import { Timeline } from "../components/story/Timeline";
import { VoicePlayback } from "../components/voice/VoicePlayback";
import { api } from "../lib/api";
import type { Story } from "../lib/types";

export function StoryPage() {
  const { storyId } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) return;
    api
      .story(storyId)
      .then(setStory)
      .catch((currentError) => setError(currentError instanceof Error ? currentError.message : "Không thể tải câu chuyện"))
      .finally(() => setIsLoading(false));
  }, [storyId]);

  const paragraphs = useMemo(() => story?.content.split(/\n+/).filter(Boolean) ?? [], [story?.content]);

  async function share() {
    if (!story) return;
    const result = await api.share(story.id);
    setShareUrl(result.url);
    await navigator.clipboard?.writeText(result.url).catch(() => undefined);
  }

  if (isLoading) return <LoadingState label="Đang mở câu chuyện..." />;
  if (error || !story) return <ErrorState message={error ?? "Không tìm thấy câu chuyện"} />;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <article className="rounded border border-ink/10 bg-white p-5 shadow-soft lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">
            {story.targetType === "landmark" ? "Địa danh" : "Bảo vật"} · {ageLabel(story.ageGroup)}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">{story.title}</h1>
          <p className="mt-4 text-lg leading-8 text-ink/65">{story.summary}</p>
          <div className="story-prose mt-8 text-base leading-8 text-ink/75">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={share} className="rounded bg-clay px-5 py-3 text-sm font-semibold text-white">
              Chia sẻ câu chuyện
            </button>
            <Link to="/map" className="rounded border border-ink/15 px-5 py-3 text-sm font-semibold text-ink/70">
              Khám phá tiếp
            </Link>
          </div>
          {shareUrl ? (
            <div className="mt-4 rounded bg-gold/15 p-3 text-sm text-ink/70">
              Link đã sẵn sàng: <a className="font-semibold text-leaf underline" href={shareUrl}>{shareUrl}</a>
            </div>
          ) : null}
        </article>
        <aside className="space-y-5">
          <section className="rounded border border-ink/10 bg-white p-4 shadow-soft">
            <h2 className="text-lg font-semibold">Voice tư vấn viên</h2>
            <p className="mt-1 text-sm leading-6 text-ink/60">Tạo giọng bằng provider, có fallback trong browser.</p>
            <div className="mt-4">
              <VoicePlayback text={`${story.title}. ${story.summary}. ${story.content}`} />
            </div>
          </section>
          <section className="rounded border border-ink/10 bg-white p-4 shadow-soft">
            <h2 className="text-lg font-semibold">Timeline</h2>
            <div className="mt-4">
              <Timeline items={story.timeline} />
            </div>
          </section>
          <section className="rounded border border-ink/10 bg-white p-4 shadow-soft">
            <h2 className="text-lg font-semibold">Graph câu chuyện</h2>
            <div className="mt-4">
              <StoryGraphView graph={story.graph} />
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function ageLabel(ageGroup: Story["ageGroup"]) {
  return {
    kids: "Trẻ em",
    teens: "Thiếu niên",
    adults: "Người lớn"
  }[ageGroup];
}
