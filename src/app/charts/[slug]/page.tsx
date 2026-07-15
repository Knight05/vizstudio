import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChart, getChartSlugs, getAdjacentCharts } from "@/lib/charts";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";
import TimeseriesExtras from "@/components/marketing/TimeseriesExtras";

const SITE = "https://vizstudio.io";

// Pre-render every chart at build time (SSG) - full static HTML per chart, no backend.
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

  const title = `${chart.name} | vizstudio`;
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

  const pager = getAdjacentCharts(slug);
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
      keywords: chart.keywords || undefined,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "50",
        highPrice: "500",
        url: `${SITE}/pricing`,
        description: "One subscription unlocks the full Viz Studio library of 75+ charts.",
      },
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
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteNav />

      <main>
        {/* ── HERO (ink) ── */}
        <section className="cp-hero">
          <div className="cp-wrap">
            <div className="cp-crumbs">
              <a href="/">vizstudio</a>
              <span className="cp-sep">/</span>
              <a href="/#library">Charts</a>
              <span className="cp-sep">/</span>
              <a href="/#library" data-cat={chart.category}>
                {chart.catLabel}
              </a>
              <span className="cp-sep">/</span>
              <span className="cp-cur">{chart.name}</span>
            </div>

            <div className="cp-hero-grid">
              <div>
                <div className="cp-eyebrow">{chart.catLabel}</div>
                <h1 className="cp-title">{chart.name}</h1>
                <div className="cp-seoline">
                  {chart.name} for Data Studio, formerly known as Looker Studio.
                </div>
                <p className="cp-tagline">{chart.tagline}</p>
                <div className="cp-ctas">
                  <a className="cp-btn-primary" href="/get-started">
                    Add to Data Studio <span>→</span>
                  </a>
                  {chart.dsLink && (
                    <a
                      className="cp-btn-ghost"
                      href={chart.dsLink}
                      target="_blank"
                      rel="noopener"
                    >
                      Open live demo
                    </a>
                  )}
                </div>
                <div className="cp-trust">
                  <span>Cross-filter ready</span>
                  <span>Theme-aware</span>
                  <span>Setup in 30s</span>
                </div>
              </div>

              <div>
                <div className="cp-frame">
                  <div className="cp-frame-bar">
                    <span className="cp-light cp-light-r"></span>
                    <span className="cp-light cp-light-y"></span>
                    <span className="cp-light cp-light-g"></span>
                    <span className="cp-url">datastudio.google.com / report</span>
                  </div>
                  {previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="cp-shot"
                      src={`/screenshots/${previewSrc}`}
                      alt={`${chart.name} in a Data Studio report`}
                    />
                  ) : (
                    <div className="cp-shot-fallback">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/icons/${chart.id}.png`}
                        alt={`${chart.name} icon`}
                        width={96}
                        height={96}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT / WHY (paper) ── */}
        <section className="cp-paper">
          <div className="cp-wrap">
            <div className="cp-cols3">
              <div className="cp-col">
                <div className="cp-kicker">What it is</div>
                <p>{chart.long}</p>
              </div>
              <div className="cp-col">
                <div className="cp-kicker">What it does</div>
                <p>{chart.what}</p>
              </div>
              <div className="cp-col">
                <div className="cp-kicker">Why use it</div>
                <p>{chart.why}</p>
              </div>
            </div>

            {chart.id === "timeseries-viz" && (
              <div className="prose cp-extras">
                <TimeseriesExtras />
              </div>
            )}

            <div className="cp-uses">
              <h2 className="cp-h2">
                Three ways teams <em>use it.</em>
              </h2>
              <div className="cp-uses-grid">
                {uses.map((u, i) => (
                  <div className="cp-use" key={i}>
                    <div className="cp-kicker">{u.tag}</div>
                    <p>{u.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SETUP (ink) ── */}
        <section className="cp-ink">
          <div className="cp-wrap">
            <div className="cp-eyebrow">Setup</div>
            <h2 className="cp-h2 cp-h2-ink">
              Add it in <em>30 seconds.</em>
            </h2>
            <div className="cp-steps">
              <div className="cp-step">
                <div className="cp-step-num">01</div>
                <p>
                  Open your Data Studio report and click{" "}
                  <strong>Add a chart → Community visualizations → Explore more</strong>.
                </p>
              </div>
              <div className="cp-step">
                <div className="cp-step-num">02</div>
                <p>
                  Paste the Viz Studio manifest URL or pick this chart from the Viz
                  Studio gallery card.
                </p>
              </div>
              <div className="cp-step">
                <div className="cp-step-num">03</div>
                <p>Bind the dimensions and metrics in the data panel. Done.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── RELATED + PAGER (paper) ── */}
        {(chart.related.length > 0 || pager) && (
          <section className="cp-paper">
            <div className="cp-wrap">
              {chart.related.length > 0 && (
                <>
                  <div className="cp-rel-head">
                    <h2 className="cp-h2">More from {chart.catLabel}</h2>
                    <a className="cp-alllink" href="/#library">
                      All 75+ charts →
                    </a>
                  </div>
                  <div className="cp-rel-grid">
                    {chart.related.map((r) => (
                      <a className="cp-tile" href={`/charts/${r.id}`} key={r.id}>
                        <div className="cp-tile-icon">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/icons/${r.id}.png`} alt="" loading="lazy" />
                        </div>
                        <div>
                          <div className="cp-tile-name">{r.name}</div>
                          <p>{r.tagline}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              )}

              {pager && (
                <nav className="cp-pager" aria-label="Browse more charts">
                  <a href={`/charts/${pager.prev.id}`}>
                    <span className="cp-pager-dir">← Previous chart</span>
                    <span className="cp-pager-name">{pager.prev.name}</span>
                  </a>
                  <a className="cp-next" href={`/charts/${pager.next.id}`}>
                    <span className="cp-pager-dir">Next chart →</span>
                    <span className="cp-pager-name">{pager.next.name}</span>
                  </a>
                </nav>
              )}
            </div>
          </section>
        )}

        {/* ── PRICING STRIP (ink) ── */}
        <section className="cp-price">
          <div className="cp-price-wrap">
            <div className="cp-eyebrow">Pricing</div>
            <h2 className="cp-price-h2">
              Included in your vizstudio <em>plan.</em>
            </h2>
            <div className="cp-amounts">
              <span className="cp-amt">
                $50<span> / month</span>
              </span>
              <span className="cp-or">or</span>
              <span className="cp-amt">
                $500<span> / year</span>
              </span>
            </div>
            <p>
              One plan, everything in it: the full library of 75+ charts. No
              per-seat upcharges, no metering. Build a real dashboard before you
              pay a cent.
            </p>
            <a className="cp-btn-primary" href="/get-started">
              Start free <span>→</span>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
