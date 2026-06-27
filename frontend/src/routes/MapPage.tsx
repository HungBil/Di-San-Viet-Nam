import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { VietnamMap } from "../components/map/VietnamMap";
import { ErrorState, LoadingState } from "../components/common/Status";
import { api } from "../lib/api";
import type { Landmark } from "../lib/types";

export function MapPage() {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .landmarks()
      .then(setLandmarks)
      .catch((currentError) => setError(currentError instanceof Error ? currentError.message : "Không thể tải map"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Đang tải Vietnam Map..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-semibold">Khám phá Việt Nam</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
            Click vào địa danh để mở danh lam thắng cảnh, tạo câu chuyện AI và chia sẻ ngay.
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <VietnamMap landmarks={landmarks} />
        <div className="space-y-3">
          {landmarks.map((landmark) => (
            <Link
              key={landmark.id}
              to={`/landmarks/${landmark.id}`}
              className="block overflow-hidden rounded border border-ink/10 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-leaf/40"
            >
              <img className="h-36 w-full object-cover" src={landmark.imageUrl} alt={landmark.name} />
              <div className="p-4">
                <p className="text-sm font-semibold text-clay">{landmark.province}</p>
                <h2 className="mt-1 text-lg font-semibold">{landmark.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">{landmark.shortDescription}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

