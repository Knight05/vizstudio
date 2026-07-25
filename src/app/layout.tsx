import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { CookieConsent } from "@/components/CookieConsent";
import { GAPageView } from "@/components/GAPageView";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

// maximumScale: 1 stops iOS Safari's auto-zoom when focusing inputs <16px,
// which was knocking the mobile layout off-grid. Manual pinch-zoom still works
// (iOS ignores maximum-scale for user-initiated zoom since iOS 10).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Viz Studio | 75+ community visualizations for Data Studio",
    template: "%s · Viz Studio",
  },
  description:
    "The most complete D3.js chart library for Google Data Studio (formerly Looker Studio). 75+ battle-tested visualizations: KPIs, time series, distributions, networks, and more. One subscription, every chart.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://vizstudio.io"),
  applicationName: "Viz Studio",
  keywords: [
    "Data Studio charts",
    "Data Studio community visualizations",
    "Looker Studio charts",
    "Looker Studio community visualizations",
    "custom charts for Data Studio",
    "D3.js visualizations",
    "Data Studio chart library",
  ],
  category: "technology",
  openGraph: {
    title: "Viz Studio",
    description: "75+ community visualizations for Data Studio.",
    type: "website",
    siteName: "Viz Studio",
    locale: "en_US",
    url: "https://vizstudio.io/",
    images: [
      {
        url: "https://vizstudio.io/images/hero-dashboard-dark.png",
        width: 1242,
        height: 741,
        alt: "Viz Studio chart library for Data Studio",
      },
    ],
  },
  twitter: { card: "summary_large_image", creator: "@vizstudio" },
  icons: { icon: "/favicon.svg" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// Site-wide structured data: Organization + WebSite (schema.org).
// Referenced by page-level JSON-LD via @id anchors.
const SITE_JSONLD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://vizstudio.io/#org",
    name: "Viz Studio",
    legalName: "Viz Studio LLC",
    url: "https://vizstudio.io/",
    logo: "https://vizstudio.io/logo-256.png",
    email: "support@vizstudio.io",
    description:
      "Viz Studio builds premium D3.js community visualizations and connectors for Google Data Studio (formerly Looker Studio).",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://vizstudio.io/#website",
    url: "https://vizstudio.io/",
    name: "Viz Studio",
    description: "75+ premium community visualizations for Data Studio.",
    publisher: { "@id": "https://vizstudio.io/#org" },
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        {/* App-shell typography (globals.css --mono / --sans) is loaded
            per-route by <AppFonts />, NOT here. The marketing pages ship their
            own Google Fonts set, so keeping this link in the root layout made
            every marketing view pay for a second render-blocking third-party
            stylesheet plus a duplicate set of woff2 files it never rendered. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSONLD) }}
        />
      </head>
      <body>
        {/* Google Analytics 4 + Consent Mode v2.
            Consent defaults to denied; the CookieConsent banner (or a saved
            previous choice in localStorage) upgrades analytics_storage. With
            consent denied GA4 still sends cookieless pings, so traffic is
            modeled without personal cookies. */}
        <Script id="ga4-consent" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            var vzConsent = 'denied';
            try { if (localStorage.getItem('vz_cookie_consent') === 'granted') vzConsent = 'granted'; } catch (e) {}
            gtag('consent', 'default', {
              ad_storage: vzConsent,
              ad_user_data: vzConsent,
              ad_personalization: vzConsent,
              analytics_storage: vzConsent,
              wait_for_update: 500
            });
            gtag('config', 'G-PWF1TRML22');
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PWF1TRML22"
          strategy="afterInteractive"
        />
        {/* reCAPTCHA v3 helper for the static-site forms (public/assets/
            forms.js + partials.js). React forms use lib/recaptcha-client.ts.
            Loads grecaptcha lazily on first use; resolves "" when no key is
            configured so forms always still submit. */}
        <Script id="vz-recaptcha" strategy="afterInteractive">
          {`
            (function () {
              var KEY = ${JSON.stringify(RECAPTCHA_SITE_KEY)};
              var loading = null;
              function load() {
                if (!KEY) return Promise.resolve(null);
                if (window.grecaptcha && window.grecaptcha.execute) return Promise.resolve(window.grecaptcha);
                if (!loading) {
                  loading = new Promise(function (resolve) {
                    var s = document.createElement('script');
                    s.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(KEY);
                    s.async = true;
                    s.onload = function () {
                      if (window.grecaptcha) window.grecaptcha.ready(function () { resolve(window.grecaptcha); });
                      else resolve(null);
                    };
                    s.onerror = function () { resolve(null); };
                    document.head.appendChild(s);
                  });
                }
                return loading;
              }
              window.vzGetRecaptchaToken = function (action) {
                return load().then(function (g) {
                  if (!g) return '';
                  return g.execute(KEY, { action: action || 'submit' }).catch(function () { return ''; });
                });
              };
            })();
          `}
        </Script>
        {children}
        <CookieConsent />
        <GAPageView />
      </body>
    </html>
  );
}
