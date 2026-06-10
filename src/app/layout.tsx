import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { TRPCProvider } from "@/trpc/provider";
import { CookieConsent } from "@/components/CookieConsent";

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
    default: "Viz Studio | 75+ community visualizations for Looker Studio",
    template: "%s · Viz Studio",
  },
  description:
    "The most complete D3.js chart library for Google Looker Studio. 75+ battle-tested visualizations: KPIs, time series, distributions, networks, and more. One subscription, every chart.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://vizstudio.io"),
  openGraph: {
    title: "Viz Studio",
    description: "75+ community visualizations for Looker Studio.",
    type: "website",
    siteName: "Viz Studio",
  },
  twitter: { card: "summary_large_image", creator: "@vizstudio" },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        {/* Preview password gate - remove before public launch */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var PW='viz37',K='vz_gate_ok';try{if(localStorage.getItem(K)==='1')return;}catch(e){return;}var p=prompt('This site is private. Enter password to view:');while(p!==null&&p!==PW){p=prompt('Incorrect password. Try again:');}if(p===PW){try{localStorage.setItem(K,'1');}catch(e){}return;}document.write('<body style="margin:0;background:#0b0c14;color:#e7e7f0;font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h1 style="font-size:18px;margin:0 0 8px">Password required</h1><p style="opacity:.7;margin:0">Refresh the page to try again.</p></div></body>');if(window.stop)window.stop();})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
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
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
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
        <TRPCProvider>{children}</TRPCProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
