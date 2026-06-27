import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GuideChat } from "../components/chat/GuideChat";
import { StoryActions } from "../components/common/StoryActions";
import { ErrorState, LoadingState } from "../components/common/Status";
import { Timeline } from "../components/story/Timeline";
import { api } from "../lib/api";
import type { ArtifactDetail } from "../lib/types";

export function ArtifactDetailPage() {
  const { artifactId } = useParams();
  const [artifact, setArtifact] = useState<ArtifactDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artifactId) return;
    api
      .artifact(artifactId)
      .then(setArtifact)
      .catch((currentError) => setError(currentError instanceof Error ? currentError.message : "Không thể tải bảo vật"))
      .finally(() => setIsLoading(false));
  }, [artifactId]);

  if (isLoading) return <LoadingState />;
  if (error || !artifact) return <ErrorState message={error ?? "Không tìm thấy bảo vật"} />;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="overflow-hidden rounded border border-ink/10 bg-white shadow-soft">
          <img className="h-[420px] w-full object-cover" src={artifact.imageUrl} alt={artifact.name} />
          <div className="p-5">
            {artifact.landmark ? (
              <Link to={`/landmarks/${artifact.landmark.id}`} className="text-sm font-semibold text-clay hover:underline">
                {artifact.landmark.name}
              </Link>
            ) : null}
            <h1 className="mt-2 text-4xl font-semibold">{artifact.name}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {[artifact.period, artifact.material, ...artifact.tags].filter(Boolean).map((item) => (
                <span key={item} className="rounded bg-paper px-3 py-2 text-sm text-ink/65">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-5 text-lg leading-8 text-ink/68">{artifact.shortDescription}</p>
            <p className="mt-4 leading-8 text-ink/70">{artifact.culturalSignificance}</p>
          </div>
        </div>
        <div className="space-y-5">
          <StoryActions targetType="artifact" targetId={artifact.id} />
          <GuideChat
            artifactId={artifact.id}
            initialSuggestions={[
              "Bảo vật này có ý nghĩa gì?",
              "Chi tiết nào nên quan sát kỹ?",
              "Kể cho trẻ em dễ hiểu hơn"
            ]}
          />
          <section className="rounded border border-ink/10 bg-white p-4 shadow-soft">
            <h2 className="text-lg font-semibold">Timeline bảo vật</h2>
            <div className="mt-4">
              <Timeline items={artifact.timeline} />
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

