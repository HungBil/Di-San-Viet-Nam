import type { TimelineItem } from "../../lib/types";

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink/60">Chưa có timeline cho câu chuyện này.</p>;
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="grid grid-cols-[84px_1fr] gap-4">
          <div className="text-sm font-semibold text-clay">{item.yearLabel}</div>
          <div className="border-l border-ink/15 pb-4 pl-4">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm leading-6 text-ink/65">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

