import type { Metadata } from "next";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";

const SITE = "https://vizstudio.io";

export const metadata: Metadata = {
  title: "Pricing | vizstudio",
  description:
    "Simple pricing for the full Viz Studio chart library. $20/month, $200/year, or $500 lifetime. Every plan unlocks all 75+ premium Data Studio charts plus the Google Calendar Connector. 14-day free trial, no credit card required.",
  alternates: { canonical: `${SITE}/pricing` },
  openGraph: {
    title: "Pricing | vizstudio",
    description:
      "Every plan unlocks the entire chart library plus the Google Calendar Connector. $20/month, $200/year, or $500 lifetime. 14-day free trial.",
    url: `${SITE}/pricing`,
    type: "website",
    images: [`${SITE}/images/hero-dashboard-dark.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | vizstudio",
    description:
      "Every plan unlocks the entire chart library plus the Google Calendar Connector. $20/month, $200/year, or $500 lifetime. 14-day free trial.",
    images: [`${SITE}/images/hero-dashboard-dark.png`],
  },
};

// Pricing structured data: the PRO product with all three offers + breadcrumbs.
const PRICING_JSONLD = [
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Viz Studio PRO",
    description:
      "One subscription, every chart: all 75+ premium Data Studio community visualizations plus the Google Calendar Connector. Pay monthly, yearly, or once for lifetime access. 14-day free trial, no credit card required.",
    url: `${SITE}/pricing`,
    image: `${SITE}/images/hero-dashboard-dark.png`,
    brand: { "@type": "Brand", name: "Viz Studio" },
    offers: [
      {
        "@type": "Offer",
        name: "PRO Monthly",
        price: "20",
        priceCurrency: "USD",
        url: `${SITE}/pricing`,
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "PRO Yearly",
        price: "200",
        priceCurrency: "USD",
        url: `${SITE}/pricing`,
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "PRO Lifetime",
        price: "500",
        priceCurrency: "USD",
        url: `${SITE}/pricing`,
        availability: "https://schema.org/InStock",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE}/pricing` },
    ],
  },
];

const CHECK = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function PlanCta({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <a className={primary ? "btn primary" : "btn"} href="/get-started">
      {label} →
    </a>
  );
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const params = await searchParams;
  const notice =
    params.checkout === "cancelled"
      ? "Checkout cancelled — no charge was made. Pick a plan whenever you're ready."
      : params.checkout === "unavailable"
        ? "Online checkout isn't available right now. Email hello@vizstudio.io and we'll get you set up."
        : null;

  return (
    <>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" key="l0" />
      <link
        rel="stylesheet"
        href="/assets/fonts/marketing.css"
        key="l3"
      />
      <link rel="stylesheet" href="/assets/style.css" key="l4" />

      <div className="blobs">
        <div className="blob b1" />
        <div className="blob b2" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PRICING_JSONLD) }}
      />
      <SiteNav />

      <main>
        <section className="block" id="pricing" style={{ paddingTop: 120 }}>
          <div className="wrap">
            <div className="section-head">
              <span className="section-tag">Pricing</span>
              <h2>Simple pricing. Full library.</h2>
              <p>
                Every tier unlocks the entire chart library and the Google Calendar
                Connector — no feature gating, no per-seat upcharges, no surprise
                metering.
              </p>
            </div>

            {notice && (
              <div
                role="status"
                style={{
                  margin: "0 auto 28px",
                  maxWidth: 560,
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.05)",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {notice}
              </div>
            )}

            <div className="price-grid" data-period="monthly">
              <div className="price">
                <div className="tier">Monthly</div>
                <div className="amount">
                  <span className="val">
                    <s className="was-price">$50</s> $20
                  </span>
                  <span className="period">/ month</span>
                </div>
                <div className="desc">Pay as you go. Full library access. Cancel anytime.</div>
                <ul>
                  <li>{CHECK}Full chart library · 75+ types</li>
                  <li>{CHECK}Google Calendar Connector included</li>
                  <li>{CHECK}Unlimited reports &amp; viewers</li>
                  <li>{CHECK}Custom branding</li>
                  <li>{CHECK}Email support</li>
                </ul>
                <div className="cta">
                  <PlanCta label="Start Monthly" />
                </div>
              </div>

              <div className="price featured">
                <span className="badge">MOST POPULAR</span>
                <div className="tier">Annual</div>
                <div className="amount">
                  <span className="val">$200</span>
                  <span className="period">/ year</span>
                </div>
                <div className="desc">Save $40 vs. monthly. Billed once, renewed yearly.</div>
                <ul>
                  <li>{CHECK}Everything in Monthly</li>
                  <li>{CHECK}Google Calendar Connector included</li>
                  <li>{CHECK}Priority support · Slack DM</li>
                  <li>{CHECK}Early access to new charts</li>
                </ul>
                <div className="cta">
                  <PlanCta label="Start Annual" primary />
                </div>
              </div>

              <div className="price">
                <span className="badge">BEST VALUE</span>
                <div className="tier">Lifetime</div>
                <div className="amount">
                  <span className="val">$500</span>
                  <span className="period">one-time</span>
                </div>
                <div className="desc">Pay once, use forever. No renewals, no subscription.</div>
                <ul>
                  <li>{CHECK}Everything in Annual</li>
                  <li>{CHECK}Google Calendar Connector included</li>
                  <li>{CHECK}All future charts &amp; updates</li>
                  <li>{CHECK}One payment — no renewals, ever</li>
                </ul>
                <div className="cta">
                  <PlanCta label="Get Lifetime" />
                </div>
              </div>
            </div>

            <p
              style={{
                textAlign: "center",
                marginTop: 28,
                fontSize: 13,
                opacity: 0.7,
              }}
            >
              Every account starts with a 14-day free trial — no credit card required.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
