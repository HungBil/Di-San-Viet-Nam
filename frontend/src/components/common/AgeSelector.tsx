import type { AgeGroup } from "../../lib/types";

const options: { value: AgeGroup; label: string; description: string }[] = [
  { value: "kids", label: "Trẻ em", description: "Dễ hiểu, nhiều hình ảnh" },
  { value: "teens", label: "Thiếu niên", description: "Nhanh, gần hiện tại" },
  { value: "adults", label: "Người lớn", description: "Sâu về bối cảnh" }
];

export function AgeSelector({ value, onChange }: { value: AgeGroup; onChange: (value: AgeGroup) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={[
            "rounded border p-3 text-left transition",
            value === option.value
              ? "border-leaf bg-leaf text-white"
              : "border-ink/10 bg-white text-ink hover:border-leaf/50"
          ].join(" ")}
        >
          <span className="block text-sm font-semibold">{option.label}</span>
          <span className={value === option.value ? "text-xs text-white/80" : "text-xs text-ink/55"}>
            {option.description}
          </span>
        </button>
      ))}
    </div>
  );
}

