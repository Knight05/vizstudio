import Link from "next/link";
import type { Metadata } from "next";
import { ReportIssueForm } from "./report-issue-form";

export const metadata: Metadata = {
  title: "Report an issue",
  description: "Found a bug or a chart that isn't behaving? Tell the Viz Studio team.",
  // Keep this page out of search engines and the sitemap.
  robots: { index: false, follow: false, nocache: true },
};

export default function ReportIssuePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "56px 24px 72px",
      }}
    >
      <Link
        href="/"
        style={{
          marginBottom: 36,
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text)",
          textDecoration: "none",
          letterSpacing: "-0.01em",
        }}
      >
        ✦ vizstudio
      </Link>

      <div style={{ width: "100%", maxWidth: 560, marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Report an issue
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
          Something not working the way it should? Send us the details and we&apos;ll get on it.
          The more specific you are, the faster we can fix it.
        </p>
      </div>

      <ReportIssueForm />

      <Link
        href="/"
        style={{ marginTop: 28, fontSize: 12.5, color: "var(--muted)", textDecoration: "none" }}
      >
        ← Back to vizstudio.io
      </Link>
    </main>
  );
}
