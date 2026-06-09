import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { TRPCProvider } from "@/trpc/provider";

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
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PWF1TRML22"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PWF1TRML22');
          `}
        </Script>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
