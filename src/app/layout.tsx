import type { Metadata } from "next";
import Script from "next/script";
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
        {/* Preview password gate — remove before public launch */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var PW='viz37',K='vz_gate_ok';try{if(localStorage.getItem(K)==='1')return;}catch(e){return;}var p=prompt('This site is private. Enter password to view:');while(p!==null&&p!==PW){p=prompt('Incorrect password. Try again:');}if(p===PW){try{localStorage.setItem(K,'1');}catch(e){}return;}document.write('<body style="margin:0;background:#0b0c1