import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChart, getChartSlugs } from "@/lib/charts";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";

const SITE = "https://vizstudio.io";

// Pre-render every chart at build time (SSG) — full static HTML per chart, no backend.
export function generateStaticParams() {
  return getChartSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

function ogImage(chart: ReturnType<typeof getChart>) {
  // og:image uses PNG for scraper compatibility (Twitter/Facebook prefer it).
  return chart?.screenshot ? `${SITE}/screenshots/${chart.screenshot}` : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chart = getChart(slug);
  if (!chart) return { title: "Chart not found" };

  const title = `${chart.name} — vizstudio`;
  const description = chart.tagline;
  const url = `${SITE}/charts/${chart.id}`;
  const image = ogImage(chart);

  return {
    title,
    description,
    keywords: chart.keywords || undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ChartPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chart = getChart(slug);
  if (!chart) notFound();

  const previewSrc = chart.screenshotWebp ?? chart.screenshot;
  const image = ogImage(chart);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Charts", item: `${SITE}/#library` },
        {
          "@type": "ListItem",
          position: 3,
          name: chart.name,
          item: `${SITE}/charts/${chart.id}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: `${chart.name} for Data Studio`,
      url: `${SITE}/charts/${chart.id}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: chart.tagline,
      isPartOf: { "@type": "SoftwareApplication", name: "vizstudio", url: `${SITE}/` },
      ...(image ? { image } : {}),
    },
  ];

  // Marketing-tone use cases: fall back to a single generic card if none.
  const uses =
    chart.uses.length > 0
      ? chart.uses
      : [
          {
            tag: "Use case",
            body: `Add a ${chart.name.toLowerCase()} to any Data Studio report that needs it.`,
          },
        ];

  return (
    <>
      {/* Marketing stylesheet + display font, scoped to this route via <head> hoist */}
      <link rel="stylesheet" href="/assets/style.css" />
      <link
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap"
        rel="stylesheet"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="blobs">
        <span className="blob blob-1"></span>
        <span className="blob blob-2"></span>
        <span className="blob blob-3"></span>
      </div>

      <SiteNav />

      <main>
        <div className="wrap">
          <div className="crumbs">
            <a href="/">vizstudio</a>
            <span>/</span>
            <a href="/#library">Charts</a>
            <span>/</span>
            <a href="/#library" data-cat={chart.category}>
              {chart.catLabel}
            </a>
            <span>/</span>
            <span>{chart.name}</span>
          </div>
        </div>

        <section className="chart-hero">
          <div className="wrap">
            <div className="chart-hero-grid">
              <div>
                <div className="chart-title-row">
                  <div className="chart-hero-icon">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/icons/${chart.id}.png`}
                      alt=""
                      style={{ opacity: 1 }}
                    />
                  </div>
                  <h1 className="chart-title">{chart.name}</h1>
                </div>
                <div className="chart-eyebrow">
                  {chart.name} for Data Studio, formerly known as Looker Studio.
                </div>
                <p className="chart-tagline">{chart.tagline}</p>
                <div className="chart-cta-row">
                  <a className="btn btn-primary" href="/get-started">
                    Add to Data Studio →
                  </a>
                  {chart.dsLink && (
                    <a
                      className="btn"
                      href={chart.dsLink}
                      target="_blank"
                      rel="noopener"
                    >
                      Open live demo
                    </a>
                  )}
                </div>
                <div className="chart-trust">
                  <span>Cross-filter ready</span>
                  <span>Theme-aware</span>
                  <span>Setup in 30s</span>
                </div>
              </div>
              <div>
                <div className="chart-preview">
                  <div className="preview-bar">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                  {previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="preview-img"
                      src={`/screenshots/${previewSrc}`}
                      alt={`${chart.name} — Data Studio screenshot`}
                      loading="lazy"
                    />
                  ) : (
                    // No screenshot yet — fall back to the chart icon, centered.
                    <div
                      className="preview-svg-wrap"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 220,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/icons/${chart.id}.png`}
                        alt={`${chart.name} icon`}
                        width={96}
                        height={96}
                        style={{ opacity: 0.85 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="wrap">
            <div className="content-grid">
              <div className="prose">
                <h2>What it is</h2>
                <p>{chart.long}</p>

                <h2>What it does</h2>
                <p>{chart.what}</p>

                <h2>Why use it</h2>
                <p>{chart.why}</p>

                <h2>Three ways teams use it</h2>
                <div className="use-cases">
                  {uses.map((u, i) => (
                    <div className="use-case" key={i}>
                      <div className="tag">{u.tag}</div>
                      <div className="body">{u.body}</div>
                    </div>
                  ))}
                </div>

                <h2>Add it in 30 seconds</h2>
                <ol
                  style={{
                    color: "var(--text-dim)",
                    paddingLeft: 18,
                    // App's Tailwind preflight resets list-style; restore markers.
                    listStyleType: "decimal",
                  }}
                >
                  <li>
                    Open your Data Studio report and click{" "}
                    <strong>
                      Add a chart → Community visualizations → Explore more
                    </strong>
                    .
                  </li>
                  <li>
                    Paste the Viz Studio manifest URL or pick this chart from the
                    Viz Studio gallery card.
                  </li>
                  <li>
                    Bind the dimensions and metrics in the data panel — done.
                  </li>
                </ol>
              </div>
            </div>

            {chart.related.length > 0 && (
              <div className="related">
                <div className="section-eyebrow" style={{ marginBottom: 16 }}>
                  More from {chart.catLabel}
                </div>
                <div className="grid">
                  {chart.related.map((r) => (
                    <a className="card" href={`/charts/${r.id}`} key={r.id}>
                      <div className="card-icon">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/icons/${r.id}.png`} alt="" />
                      </div>
                      <div className="card-name">{r.name}</div>
                      <div className="card-desc">{r.tagline}</div>
                      <div className="card-foot">
                        <span>{chart.catLabel.toUpperCase()}</span>
                        <span className="card-arrow">→</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="pricing-strip">
          <div className="wrap">
            <div className="section-eyebrow">Pricing</div>
            <h2 className="pricing-strip-title">Included in your vizstudio plan.</h2>
            <div className="price-band">
              <div>
                <div className="amounts">
                  <div className="amt"><span className="val">$50</span><span className="per">/ month</span></div>
                  <div className="amt"><span className="or">or</span></div>
                  <div className="amt"><span className="val">$500</span><span className="per">/ year</span></div>
                </div>
                <p>
                  One plan, everything in it — the Google Calendar Connector plus
                  the full library of 75+ charts. No per-seat upcharges, no
                  metering. Build a real dashboard before you pay a cent.
                </p>
              </div>
              <div className="cta-side">
                <a className="btn btn-primary" href="/get-started">Start free →</a>
                <div className="micro">No credit card required.</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
