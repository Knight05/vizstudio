"use client";

import { useEffect, useState } from "react";
import { getRecaptchaToken, preloadRecaptcha } from "@/lib/recaptcha-client";

/* ── GA4 helper ─────────────────────────────────────────── */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
function track(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, params);
  }
}

const CATEGORIES = [
  { value: "bug", label: "Something is broken (bug)" },
  { value: "chart", label: "A chart isn't rendering correctly" },
  { value: "billing", label: "Billing or account issue" },
  { value: "other", label: "Something else" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

export function ReportIssueForm() {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category>("bug");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    preloadRecaptcha();
  }, []);

  const canSubmit =
    status !== "sending" &&
    message.trim().length > 0 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  async function submit() {
    setStatus("sending");
    setError(null);
    try {
      const recaptchaToken = await getRecaptchaToken("reportissue");
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: "reportissue",
          email: email.trim(),
          category,
          message: message.trim(),
          source: "/reportissue",
          website, // honeypot - empty for humans
          recaptchaToken: recaptchaToken || undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !json.ok) throw new Error("Submission failed");
      setStatus("sent");
      setMessage("");
      track("report_issue_submit", { category });
    } catch {
      setStatus("error");
      setError("Something went wrong sending your report. Please try again, or email support@vizstudio.io.");
    }
  }

  if (status === "sent") {
    return (
      <div style={S.card}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Report received ✓</div>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
          Thanks, it&apos;s in the team&apos;s inbox. If you left an email, we&apos;ll follow up there.
        </p>
        <button
          style={S.btnSecondary}
          onClick={() => {
            setStatus("idle");
            setCategory("bug");
            setEmail((e) => e);
          }}
        >
          Report another issue
        </button>
      </div>
    );
  }

  return (
    <div style={S.card}>
      <div style={{ display: "grid", gap: 16 }}>
        <label style={S.field}>
          <span style={S.label}>Your email</span>
          <input
            type="email"
            style={S.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
          />
          <span style={S.hint}>So we can reach you with a fix or follow-up question.</span>
        </label>

        <label style={S.field}>
          <span style={S.label}>What kind of issue?</span>
          <select
            style={S.input}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label style={S.field}>
          <span style={S.label}>Describe what happened</span>
          <textarea
            style={{ ...S.input, minHeight: 140, resize: "vertical", fontFamily: "var(--sans)" }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What did you expect, and what happened instead? Include the chart name or page URL if you can."
          />
        </label>

        {/* Honeypot - hidden from humans, bots fill it */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <label>
            Leave this field empty
            <input
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        {error && <div style={{ fontSize: 12.5, color: "var(--acc-rose)" }}>{error}</div>}

        <div>
          <button style={{ ...S.btnPrimary, opacity: canSubmit ? 1 : 0.5 }} onClick={submit} disabled={!canSubmit}>
            {status === "sending" ? "Sending…" : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    maxWidth: 560,
    background: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: 28,
  },
  field: { display: "grid", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "var(--text)" },
  hint: { fontSize: 11.5, color: "var(--muted)" },
  input: {
    width: "100%",
    background: "var(--bg-1)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "10px 12px",
    fontSize: 13.5,
    color: "var(--text)",
    fontFamily: "var(--sans)",
    outline: "none",
  },
  btnPrimary: {
    background: "var(--acc-green)",
    color: "#06140a",
    border: "none",
    borderRadius: "var(--r-md)",
    padding: "10px 18px",
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "var(--sans)",
  },
  btnSecondary: {
    background: "var(--bg-1)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--sans)",
  },
};
