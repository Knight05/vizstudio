import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LiveChart } from "@/components/LiveChart";
import { getChartBySlug, loadManifest } from "@/lib/manifest";

export async function generateStaticParams() {
  const manifest = loadManifest();
  return manifest.components.map((c) => ({ slug: c.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const chart = getChartBySlug(slug);
  if (!chart) return { title: "Not found" };
  return {
    title: `${chart.name}`,
    description: chart.shortDescription,
    openGraph: {
      title: `${chart.name} · Viz Studio`,
      description: chart.shortDescription,
      images: [{ url: `/icons/${chart.id}.png`, width: 256, height: 256 }],
    },
  };
}

export default async function ChartPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const chart = getChartBySlug(slug);
  if (!chart) notFound();

  // Related charts: same category, excluding current.
  const manifest = loadManifest();
  const related = manifest.components
    .filter((c) => c.category === chart.category && c.id !== chart.id)
    .slice(0, 5);

  const installSnippet = `// Looker Studio: Resource → Manage added community visualizations
// Manifest path:
gs://vizstudio-cid9483029/manifest.json

// Or embed directly in your own app:
import { ${toPascal(chart.id)} } from "@vizstudio/charts";
<${toPascal(chart.id)} data={yourData} license="VZ-XXXX-..." />`;

  return (
    <>
      <Navbar />
      <main>
        <div className="mx-auto max-w-page px-6 pt-10 pb-6">
          <nav className="flex items-center gap-2 text-[11px] text-muted mb-6">
            <Link href="/showcase" className="hover:text-text">Showcase</Link>
            <span>/</span>
            <Link
              href={`/showcase?category=${encodeURIComponent(chart.category)}`}
              className="hover:text-text"
            >
              {chart.category}
            </Link>
            <span>/</span>
            <span className="text-text-dim">{chart.id}</span>
          </nav>

          <div className="grid gap-10 md:grid-cols-[1fr_320px]">
            {/* Main column */}
            <div>
              <div className="flex items-start gap-5 mb-6">
                <div className="h-20 w-20 shrink-0 rounded border border-border bg-panel p-3 flex items-center justify-center">
                  <Image
                    src={`/icons/${chart.id}.png`}
                    alt={chart.name}
                    width={64}
                    height={64}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="pill">{chart.category}</span>
                  <h1 className="mt-2 font-sans text-3xl md:text-4xl font-semibold tracking-tight">
                    {chart.name}
                  </h1>
                  <p className="mt-2 text-[14px] text-text-dim font-sans leading-relaxed">
                    {chart.shortDescription}
                  </p>
                </div>
              </div>

              <LiveChart slug={chart.id} name={chart.name} />

              <section className="mt-10">
                <h2 className="cat-h2 mb-3">
                  <span>What it does</span>
                  <span className="line" />
                </h2>
                <p className="text-[14px] leading-relaxed text-text font-sans max-w-[70ch]">
                  {chart.longDescription}
                </p>
              </section>

              <section className="mt-10">
                <h2 className="cat-h2 mb-3">
                  <span>When to reach for it</span>
                  <span className="line" />
                </h2>
                <ul className="grid gap-2 md:grid-cols-2 text-[13px] font-sans text-text-dim">
                  {chart.useCases.map((u, i) => (
                    <li
                      key={i}
                      className="flex gap-2 card !p-3 !bg-panel/60"
                    >
                      <span className="text-accent-green shrink-0">→</span>
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-10">
                <h2 className="cat-h2 mb-3">
                  <span>Example data shapes</span>
                  <span className="line" />
                </h2>
                <div className="space-y-2">
                  {chart.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="card !p-4 !bg-panel/60 text-[13px] text-text font-sans"
                    >
                      <span className="text-muted mr-2 font-mono text-[11px]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {ex}
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-10">
                <h2 className="cat-h2 mb-3">
                  <span>Install</span>
                  <span className="line" />
                </h2>
                <pre className="code whitespace-pre text-[12px] overflow-x-auto">
                  {installSnippet}
                </pre>
                <div className="mt-3 flex gap-2">
                  <Link href="/signup" className="btn btn-primary">
                    Get a license key
                  </Link>
                  <Link href="/docs/install" className="btn">
                    Install guide
                  </Link>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="card p-5">
                <h3 className="text-[10px] uppercase tracking-widest text-muted mb-3">
                  At a glance
                </h3>
                <dl className="grid grid-cols-[80px_1fr] gap-y-2 text-[12px]">
                  <dt className="text-muted">Slug</dt>
                  <dd className="font-mono text-text-dim">{chart.id}</dd>
                  <dt className="text-muted">Category</dt>
                  <dd className="text-text-dim">{chart.category}</dd>
                  <dt className="text-muted">Tags</dt>
                  <dd className="flex flex-wrap gap-1">
                    {chart.tags.map((t) => (
                      <span key={t} className="pill !py-0.5 !px-2 !text-[9.5px]">
                        {t}
                      </span>
                    ))}
                  </dd>
                  <dt className="text-muted">Updated</dt>
                  <dd className="text-text-dim">Apr 2026</dd>
                </dl>
              </div>

              {related.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-[10px] uppercase tracking-widest text-muted mb-3">
                    Related in {chart.category}
                  </h3>
                  <ul className="space-y-2">
                    {related.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={`/charts/${r.id}`}
                          className="flex items-center gap-3 hover:bg-panel-2 rounded p-1.5 -m-1.5"
                        >
                          <Image
                            src={`/icons/${r.id}.png`}
                            alt={r.name}
                            width={32}
                            height={32}
                            className="rounded bg-bg-1 p-1 border border-border"
                          />
                          <span className="text-[12px] text-text-dim group-hover:text-text">
                            {r.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="card p-5 bg-panel-2">
                <h3 className="font-sans text-[15px] font-semibold text-text mb-1">
                  Need this, plus 117 more?
                </h3>
                <p className="text-[12px] text-text-dim mb-3 leading-relaxed">
                  Every chart, every palette, every license. $15/mo, yearly.
                </p>
                <Link href="/pricing" className="btn btn-primary w-full justify-center">
                  See pricing →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function toPascal(slug: string) {
  return slug
    .split("-")
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join("");
}
