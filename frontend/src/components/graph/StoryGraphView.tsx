import type { StoryGraph } from "../../lib/types";

export function StoryGraphView({ graph }: { graph: StoryGraph }) {
  if (graph.nodes.length === 0) {
    return <p className="text-sm text-ink/60">Chưa có graph câu chuyện.</p>;
  }

  return (
    <div className="rounded bg-[#f6f2e8] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {graph.nodes.map((node) => (
          <div key={node.id} className="rounded border border-ink/10 bg-white p-3">
            <p className="text-sm font-semibold">{node.label}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink/45">{node.type}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {graph.edges.map((edge) => (
          <div key={`${edge.source}-${edge.target}-${edge.label}`} className="rounded bg-white/70 px-3 py-2 text-xs text-ink/65">
            {edge.source} <span className="font-semibold text-clay">{edge.label}</span> {edge.target}
          </div>
        ))}
      </div>
    </div>
  );
}

