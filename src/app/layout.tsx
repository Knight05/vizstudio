import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/trpc/provider";

export const metadata: Metadata = {
  title: {
    default: "Viz Studio — 118 community visualizations for Looker Studio",
    template: "%s · Viz Studio",
  },
  description:
    "The most complete D3.js chart library for Google Looker Studio. 118 battle-tested visualizations — KPIs, time series, distributions, networks, and more. One subscription, every chart.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Viz Studio",
    description: "118 community visualizations for Looker Studio.",
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
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
