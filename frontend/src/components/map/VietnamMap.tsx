import { Link } from "react-router-dom";
import type { Landmark } from "../../lib/types";

const markerPositions: Record<string, { top: string; left: string }> = {
  "ha-long-bay": { top: "18%", left: "59%" },
  "thang-long-citadel": { top: "26%", left: "45%" },
  "imperial-city-hue": { top: "54%", left: "53%" },
  "hoi-an-ancient-town": { top: "64%", left: "58%" }
};

export function VietnamMap({ landmarks }: { landmarks: Landmark[] }) {
  return (
    <div className="relative min-h-[560px] overflow-hidden rounded border border-ink/10 bg-[#edf5ef] p-5 shadow-soft">
      <div className="absolute inset-x-8 top-8 h-24 rounded-full bg-gold/20 blur-3xl" />
      <div className="heritage-map-shape absolute left-1/2 top-8 h-[500px] w-64 -translate-x-1/2 bg-leaf/90 shadow-soft" />
      <div className="heritage-map-shape absolute left-1/2 top-10 h-[480px] w-56 -translate-x-1/2 bg-moss/70" />

      {landmarks.map((landmark) => {
        const position = markerPositions[landmark.id] ?? { top: "50%", left: "50%" };
        return (
          <Link
            key={landmark.id}
            to={`/landmarks/${landmark.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-white px-3 py-2 text-xs font-semibold text-ink shadow-soft transition hover:-translate-y-[55%] hover:bg-clay hover:text-white"
            style={position}
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gold" />
            {landmark.name}
          </Link>
        );
      })}

      <div className="absolute bottom-5 left-5 right-5 rounded bg-white/85 p-4 backdrop-blur">
        <p className="text-sm font-semibold">Vietnam Map</p>
        <p className="mt-1 text-xs leading-5 text-ink/60">
          Click marker để mở danh lam thắng cảnh, sau đó tạo câu chuyện AI và chia sẻ.
        </p>
      </div>
    </div>
  );
}

