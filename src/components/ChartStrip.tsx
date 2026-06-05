import Link from "next/link";
import Image from "next/image";
import { loadManifest, CATEGORY_ORDER } from "@/lib/manifest";

/**
 * Featured chart strip. Shows 4 categories with 4 charts each on the homepage
 * to tease the library depth without dumping all 118.
 */
export function ChartStrip() {
  const manifest = loadManifest();

  const featured = ["KPI", "Time Series", "Comparison", "Network & Flow"] as const;
  const groups = featured.map((cat) => ({
    cat,
    items: manifest.components.filter((c) => c.category === cat).slice(0, 4),
  }));

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-page px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="cat-h2">
              <span>A glimpse of the library</span>
              <span className="line" />
            </h2>
            <h3 className="mt-4 font-sans text-3xl md:text-4xl font-semibold tracking-tight max-w-[22ch]">
              {manifest.components.length} charts. Every one designed, documented, and drop-in.
            </h3>
          </div>
          <Link href="/showcase" className="btn shrink-0">See all →</Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {groups.map((g) => (
            <div key={g.cat}>
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-widest text-muted">
                  {g.cat}
                </span>
                <Link
                  href={`/showcase?category=${encodeURIComponent(g.cat)}`}
                  className="text-[11px] text-text-dim hover:text-text"
                >
                  see {CATEGORY_ORDER.indexOf(g.cat) + 1 ? "category" : ""} →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {g.items.map((c) => (
                  <Link
                    key={c.id}
                    href={`/charts/${c.id}`}
                    className="card group block p-3"
                    title={c.shortDescription}
                  >
                    <div className="aspect-square rounded bg-bg-1 p-2 flex items-center justify-center overflow-hidden">
                      <Image
                        src={`/icons/${c.id}.png`}
                        alt={c.name}
                        width={96}
                        height={96}
                        className="opacity-85 group-hover:opacity-100 transition"
                      />
                    </div>
                    <div className="mt-2 text-[11.5px] text-text leading-tight line-clamp-2">
                      {c.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
