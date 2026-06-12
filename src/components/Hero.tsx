import Link from "next/link";
import Image from "next/image";
import { loadManifest } from "@/lib/manifest";

export function Hero() {
  const manifest = loadManifest();
  const chartCount = manifest.components.length;

  // Ticker: take 40 icons to flow beneath the headline
  const tickerIds = manifest.components
    .slice(0, 40)
    .map((c) => c.id);

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="guides absolute inset-0 opacity-40 pointer-events-none" />

      <div className="relative mx-auto max-w-page px-6 pt-24 pb-16">
        <div className="flex flex-col items-start gap-4">
          <span className="pill">
            <span className="dot-live" />
            v2.4: 8 new charts this month
          </span>

          <h1 className="font-sans text-[44px] md:text-[64px] leading-[1.02] font-bold tracking-tight text-text max-w-[16ch]">
            Data Studio,
            <br />
            but{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--acc-green), var(--acc-blue), var(--acc-violet))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              finally
            </span>{" "}
            beautiful.
          </h1>

          <p className="max-w-[58ch] text-[15px] leading-relaxed text-text-dim font-sans">
            {chartCount} hand-crafted D3.js visualizations (from KPI cards to
            Sankey diagrams to hex-bin density maps) that plug straight into
            Google Data Studio (formerly Looker Studio). One subscription, every chart, live data.
          </p>

          <div className="mt-2 flex items-center gap-3">
            <Link href="/signup" className="btn btn-primary !text-[13px] !py-2.5 !px-5">
              Start 14-day trial →
            </Link>
            <Link href="/showcase" className="btn !text-[13px] !py-2.5 !px-5">
              Browse the library
            </Link>
            <span className="text-[11px] text-muted">No credit card</span>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div
        className="relative border-t border-border bg-bg-1 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
        }}
      >
        <div
          className="flex gap-3 py-4"
          style={{ animation: "marquee 60s linear infinite", width: "max-content" }}
        >
          {[...tickerIds, ...tickerIds].map((id, i) => (
            <div
              key={`${id}-${i}`}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-border bg-panel"
              title={id}
            >
              <Image
                src={`/icons/${id}.png`}
                alt={id}
                width={44}
                height={44}
                className="opacity-80"
              />
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { to { transform: translateX(-50%); } }`}</style>
      </div>
    </section>
  );
}
