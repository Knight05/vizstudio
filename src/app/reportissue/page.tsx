import type { Metadata } from "next";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";
import { ReportIssueForm } from "./report-issue-form";

export const metadata: Metadata = {
  title: "Report an issue",
  description: "Found a bug or a chart that isn't behaving? Tell the Viz Studio team.",
  // Keep this page out of search engines and the sitemap.
  robots: { index: false, follow: false, nocache: true },
};

export default function ReportIssuePage() {
  return (
    <>
      <link rel="stylesheet" href="/assets/style.css" />
      <link
        rel="stylesheet"
        href="/assets/fonts/marketing.css"
      />
      <SiteNav />
      <main
        style={{
          minHeight: "64vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "64px 24px 80px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560, marginBottom: 24 }}>
          <div className="section-eyebrow" style={{ marginBottom: 10 }}>
            Support
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em", color: "var(--text)" }}>
            Report an issue
          </h1>
          <p style={{ fontSize: 14.5, color: "var(--text-dim)", margin: 0, lineHeight: 1.6 }}>
            Something not working the way it should? Send us the details and we&apos;ll get on it.
            The more specific you are, the faster we can fix it.
          </p>
        </div>

        <ReportIssueForm />
      </main>
      <SiteFooter />
    </>
  );
}
