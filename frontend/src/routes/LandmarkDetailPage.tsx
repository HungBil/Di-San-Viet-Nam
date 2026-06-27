import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StoryActions } from "../components/common/StoryActions";
import { ErrorState, LoadingState } from "../components/common/Status";
import { Timeline } from "../components/story/Timeline";
import { api } from "../lib/api";
import type { LandmarkDetail } from "../lib/types";

export function LandmarkDetailPage() {
  const { landmarkId } = useParams();
  const [landmark, setLandmark] = useState<LandmarkDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!landmarkId) return;
    api
      .landmark(landmarkId)
      .then(setLandmark)
      .catch((currentError) => setError(currentError instanceof Error ? currentError.message : "Không thể tải địa danh"))
      .finally(() => setIsLoading(false));
  }, [landmarkId]);

  if (isLoading) return <LoadingState />;
  if (error || !landmark) return <ErrorState message={error ?? "Không tìm thấy địa danh"} />;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded border border-ink/10 bg-white shadow-soft">
        <img className="h-[360px] w-full object-cover" src={landmark.imageUrl} alt={landmark.name} />
        <div className="grid gap-8 p-5 lg:grid-cols-[1fr_380px] lg:p-8">
          <div>
            <p className="text-sm font-semibold text-clay">{landmark.province}</p>
            <h1 className="mt-2 text-4xl font-semibold">{landmark.name}</h1>
            <p className="mt-4 text-lg leading-8 text-ink/68">{landmark.shortDescription}</p>
            <p className="mt-4 leading-8 text-ink/70">{landmark.historySummary}</p>
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Điểm nhấn du lịch</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {landmark.tourismHighlights.map((highlight) => (
                  <span key={highlight} className="rounded bg-paper px-3 py-2 text-sm text-ink/70">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Timeline</h2>
              <div className="mt-4">
                <Timeline items={landmark.timeline} />
              </div>
            </div>
          </div>
          <aside className="space-y-4">
            <StoryActions targetType="landmark" targetId={landmark.id} />
            <section className="rounded border border-ink/10 bg-white p-4">
              <h2 className="text-lg font-semibold">Bảo vật liên quan</h2>
              <div className="mt-3 space-y-3">
                {landmark.artifacts.map((artifact) => (
                  <Link key={artifact.id} to={`/artifacts/${artifact.id}`} className="block rounded bg-paper p-3 transition hover:bg-gold/20">
                    <p className="text-sm font-semibold">{artifact.name}</p>
                    <p className="mt-1 text-xs leading-5 text-ink/55">{artifact.shortDescription}</p>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

