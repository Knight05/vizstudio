const FEATURES = [
  {
    tag: "D3.js native",
    title: "Charts that respect your data.",
    body: "Every viz is built with D3, no wrappers, no bloat. Scales gracefully from 10 rows to 10,000, from phone to boardroom projector.",
  },
  {
    tag: "Looker-ready",
    title: "One-click install into any report.",
    body: "Paste a license key into Looker Studio's community viz picker. Every chart loads in under 800ms, cross-filters natively, and respects your theme.",
  },
  {
    tag: "OKLCH palettes",
    title: "Colors that look good everywhere.",
    body: "Seven built-in palettes, 100% perceptually uniform. Red means warning, green means go, and everything in between stays legible on dark or light.",
  },
  {
    tag: "Typed configs",
    title: "Configure without code.",
    body: "Every chart exposes a clean config panel (sort, bucket, truncate, tooltip formatting), all without touching JSON. Power users can still export and version.",
  },
  {
    tag: "Open roadmap",
    title: "Ship requests in days, not quarters.",
    body: "Public backlog on GitHub. Upvote what matters. Most community-requested charts land within 10 business days.",
  },
  {
    tag: "Compliant",
    title: "SOC 2 Type II. Zero data egress.",
    body: "Charts render client-side inside your Looker Studio session. Your data never touches our servers. Auditor-friendly, CISO-approved.",
  },
];

export function FeatureGrid() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-page px-6 py-20">
        <div className="mb-12">
          <h2 className="cat-h2">
            <span>Why teams ditch Looker's defaults</span>
            <span className="line" />
          </h2>
          <h3 className="mt-4 font-sans text-3xl md:text-4xl font-semibold tracking-tight max-w-[20ch]">
            Built for reports people actually read.
          </h3>
        </div>

        <div className="grid gap-px bg-border md:grid-cols-3 border border-border">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-bg p-8">
              <span className="pill">{f.tag}</span>
              <h4 className="mt-4 font-sans text-[18px] font-semibold text-text leading-snug">
                {f.title}
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed text-text-dim font-sans">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
