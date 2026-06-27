import { MapPinned } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ErrorState, LoadingState } from "../components/common/Status";
import { api } from "../lib/api";
import type { Story } from "../lib/types";

export function SharePage() {
  const { shareId } = useParams();
  const [searchParams] = useSearchParams();
  const card = getCard(searchParams);

  if (shareId === "card" && card) {
    return (
      <section className="heritage-surface -mt-[88px] grid min-h-screen place-items-center px-4 py-28">
        <article className="w-full max-w-2xl rounded-lg border border-[var(--heritage-line)] bg-[#fff8eb] p-7 shadow-[0_22px_70px_rgba(111,86,45,0.18)]">
          <p className="font-serif text-5xl text-[var(--heritage-bronze)]">
            ”
          </p>
          <p className="mt-4 font-serif text-2xl leading-10 text-[var(--heritage-brown)]">
            {card.message}
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-[var(--heritage-paper-deep)]">
              {card.avatar ? (
                <img className="h-full w-full object-cover" src={card.avatar} alt="" />
              ) : null}
            </div>
            <div>
              <p className="font-semibold text-[var(--heritage-brown)]">
                {card.name}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--heritage-muted)]">
                {card.title}
              </p>
              <p className="mt-1 text-xs text-[var(--heritage-muted)]">
                <MapPinned className="mr-1 inline" size={13} />
                {card.summary}
              </p>
            </div>
          </div>
          <Link
            className="mt-7 inline-flex rounded bg-[var(--heritage-brown)] px-5 py-3 text-sm font-semibold text-white"
            to={`/map?marker=${encodeURIComponent(card.marker)}`}
          >
            Mở địa điểm 3D
          </Link>
        </article>
      </section>
    );
  }

  return <StoryShare shareId={shareId} />;
}

function StoryShare({ shareId }: { shareId?: string }) {
  const [story, setStory] = useState<(Story & { shareId: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;
    api
      .shareStory(shareId)
      .then(setStory)
      .catch((currentError) =>
        setError(
          currentError instanceof Error
            ? currentError.message
            : "Không thể tải share card",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [shareId]);

  if (isLoading) return <LoadingState label="Đang tải story card..." />;
  if (error || !story)
    return <ErrorState message={error ?? "Không tìm thấy story card"} />;

  return (
    <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-5xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <article className="w-full overflow-hidden rounded border border-ink/10 bg-white shadow-soft">
        <div className="bg-ink p-8 text-white">
          <p className="text-sm font-semibold text-gold">
            Viet Heritage AI Story Card
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">
            {story.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/72">
            {story.summary}
          </p>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="line-clamp-[8] leading-8 text-ink/72">
              {story.content}
            </p>
          </div>
          <div className="rounded bg-paper p-5">
            <p className="text-sm font-semibold">Thông tin chia sẻ</p>
            <dl className="mt-4 space-y-3 text-sm text-ink/65">
              <div>
                <dt className="font-semibold text-ink">Loại</dt>
                <dd>{story.targetType === "landmark" ? "Địa danh" : "Bảo vật"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Nhóm tuổi</dt>
                <dd>{story.ageGroup}</dd>
              </div>
            </dl>
            <Link
              to="/map"
              className="mt-5 block rounded bg-leaf px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Khám phá câu chuyện khác
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}

function getCard(params: URLSearchParams) {
  const title = params.get("title");
  const marker = params.get("marker");
  if (!title || !marker) return null;

  return {
    avatar: params.get("avatar") ?? "",
    marker,
    message: params.get("message") ?? "",
    name: params.get("name") ?? "Khách tham quan",
    summary: params.get("summary") ?? "",
    title,
  };
}
