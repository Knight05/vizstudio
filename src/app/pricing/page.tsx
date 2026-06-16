import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";

const SITE = "https://vizstudio.io";

export const metadata: Metadata = {
  title: "Pricing | vizstudio",
  description:
    "Simple pricing for the full Viz Studio chart library. $50/month or $500/year. Every plan unlocks all 75+ premium Data Studio charts. 14-day free trial, no credit card required.",
  alternates: { canonical: `${SITE}/pricing` },
  openGraph: {
    title: "Pricing | vizstudio",
    description:
      "Every plan unlocks the entire chart library. $50/month or $500/year. 14-day free trial.",
    url: `${SITE}/pricing`,
    type: "website",
    images: [`${SITE}/images/hero-dashboard-dark.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | vizstudio",
    description:
      "Every plan unlocks the entire chart library. $50/month or $500/year. 14-day free trial.",
    images: [`${SITE}/images/hero-dashboard-dark.png`],
  },
};

// Pricing structured data: the PRO product with both offers + breadcrumbs.
const PRICING_JSONLD = [
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Viz Studio PRO",
    description:
      "One subscription, every chart: all 75+ premium Data Studio community visualizations plus the Google Calendar Connector. 14-day free trial, no credit card required.",
    url: `${SITE}/pricing`,
    image: `${SITE}/images/hero-dashboard-dark.png`,
    brand: { "@type": "Brand", name: "Viz Studio" },
    offers: [
      {
        "@type": "Offer",
        name: "PRO Monthly",
        price: "50",
        priceCurrency: "USD",
        url: `${SITE}/pricing`,
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "PRO Yearly",
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

function PlanCta({
  isAuthed,
  plan,
  label,
  primary,
}: {
  isAuthed: boolean;
  plan: "PRO_MONTHLY" | "PRO_YEARLY";
  label: string;
  primary?: boolean;
}) {
  if (!isAuthed) {
    return (
      <a className={primary ? "btn primary" : "btn"} href="/get-started">
        {label} →
      </a>
    );
  }
  return (
    <form action={`/api/stripe/upgrade?plan=${plan}&from=pricing`} method="POST" style={{ display: "contents" }}>
      <button type="submit" className={primary ? "btn primary" : "btn"}>
        {label} →
      </button>
    </form>
  );
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const [session, params] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    searchParams,
  ]);
  const isAuthed = Boolean(session?.user);
  const notice =
    params.checkout === "cancelled"
      ? "Checkout cancelled — no charge was made. Pick a plan whenever you're ready."
      : params.checkout === "unavailable"
        ? "Online checkout isn't available right now. Email hello@vizstudio.io and we'll get you set up."
        : null;

  return (
    <>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" key="l0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" key="l1" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" key="l2" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap"
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
                Every tier unlocks the entire chart library, no feature gating, no
                per-seat upcharges, no surprise metering.
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
                    <s className="was-price">$75</s> $50
                  </span>
                  <span className="period">/ month</span>
                </div>
                <div className="desc">Pay as you go. Full library access. Cancel anytime.</div>
                <ul>
                  <li>{CHECK}Full chart library · 75+ types</li>
                  <li>{CHECK}Unlimited reports &amp; viewers</li>
                  <li>{CHECK}Custom branding</li>
                  <li>{CHECK}Email support</li>
                </ul>
                <div className="cta">
                  <PlanCta isAuthed={isAuthed} plan="PRO_MONTHLY" label="Start Monthly" />
                </div>
              </div>

              <div className="price featured">
                <span className="badge">MOST POPULAR</span>
                <div className="tier">Annual</div>
                <div className="amount">
                  <span className="val">$500</span>
                  <span className="period">/ year</span>
                </div>
                <div className="desc">Save $100 vs. monthly. Billed once, renewed yearly.</div>
                <ul>
                  <li>{CHECK}Everything in Monthly</li>
                  <li>{CHECK}Priority support · Slack DM</li>
                  <li>{CHECK}Early access to new charts</li>
                </ul>
                <div className="cta">
                  <PlanCta isAuthed={isAuthed} plan="PRO_YEARLY" label="Start Annual" primary />
                </div>
              </div>

              <div className="price">
                <div className="tier">Custom</div>
                <div className="amount">
                  <span className="val" style={{ fontSize: 38 }}>
                    Let&apos;s talk
                  </span>
                </div>
                <div className="desc">
                  Enterprise features, SSO, dedicated infra, custom chart builds.
                </div>
                <ul>
                  <li>{CHECK}Everything in Annual</li>
                  <li>{CHECK}SSO · SAML · SCIM</li>
                  <li>{CHECK}Dedicated CSM</li>
                  <li>{CHECK}Custom chart builds</li>
                </ul>
                <div className="cta">
                  <a className="btn" href="mailto:hello@vizstudio.io?subject=Viz%20Studio%20custom%20plan">
                    Contact sales →
                  </a>
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
