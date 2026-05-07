import { Suspense } from "react";

export const metadata = {
  title: "Viz Studio — Coming Soon",
  description:
    "121 hand-built chart components for Google Looker Studio. Launching 2026.",
};

// Featured icons — picked for visual variety
const FEATURED = [
  "sunburstChart",
  "chord-viz",
  "calendarHeatmap",
  "tornado-viz",
  "matrixchart-viz",
  "waffle-viz",
  "venn-viz",
  "hexbin-viz",
  "depwheel-viz",
  "streamgraph-viz",
  "slicedice-viz",
  "radialtree-viz",
];

export default function ComingSoonPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* grid background */}
      <div className="guides absolute inset-0 opacity-25 pointer-events-none" />

      {/* radial accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, color-mix(in oklch, var(--acc-green) 8%, transparent), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
        {/* status pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--panel)] mb-10">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
              style={{ background: "var(--acc-green)" }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: "var(--acc-green)" }}
            />
          </span>
          <span className="text-[10px] uppercase tracking-widest font-mono text-[var(--text-dim)]">
            Launching 2026
          </span>
        </div>

        <h1 className="font-sans text-5xl md:text-7xl font-semibold tracking-tight mb-6">
          Viz Studio
        </h1>

        <p className="text-[14px] md:text-[16px] text-[var(--text-dim)] max-w-[58ch] mx-auto mb-16 font-sans leading-relaxed">
          121 hand-built chart components for Google Looker Studio. Sankey
          diagrams, tornado charts, calendar heatmaps, chord diagrams, and
          117 more — drag into any dashboard.
        </p>

        {/* Featured icons grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-w-2xl mx-auto mb-14">
          {FEATURED.map((id) => (
            <div
              key={id}
              className="aspect-square rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2 transition-colors hover:bg-[var(--panel-2)]"
            >
              <img
                src={`/icons/${id}.png`}
                alt=""
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--muted)] font-mono uppercase tracking-widest">
          vizstudio.io · 121 components · D3.js · Looker Studio
        </p>
      </div>
    </main>
  );
}
