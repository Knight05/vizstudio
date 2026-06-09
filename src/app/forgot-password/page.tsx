"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

// Request-a-reset page. Emails a set-password link (Better-Auth reset flow)
// that lands on /reset-password?token=…

const C = {
  card: {
    background: "#11131f",
    border: "1px solid rgba(148,163,255,0.14)",
    borderRadius: 16,
    padding: "36px 32px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
  } as React.CSSProperties,
  label: {
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "#9aa1c0",
  },
  input: {
    background: "#0a0b14",
    border: "1px solid rgba(148,163,255,0.18)",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    color: "#e7e9f5",
    outline: "none",
    width: "100%",
  } as React.CSSProperties,
  button: {
    background: "linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef)",
    border: "none",
    borderRadius: 8,
    padding: "11px 12px",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
    width: "100%",
    marginTop: 8,
  } as React.CSSProperties,
};

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Better-Auth emails the reset link via sendResetPassword (see lib/auth.ts).
      const { error } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });
      if (error) throw new Error(error.message ?? "Could not send the link");
      // Always show success - never reveal whether an account exists.
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div style={C.card}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px", color: "#e7e9f5" }}>
          Check your inbox.
        </h1>
        <p style={{ fontSize: 13, color: "#9aa1c0", margin: "0 0 18px", lineHeight: 1.6 }}>
          If an account exists for <span style={{ color: "#e7e9f5" }}>{email}</span>,
          we just sent a link to set a new password. The link expires in 1 hour.
        </p>
        <Link href="/login" style={{ ...C.button, display: "block", textAlign: "center", textDecoration: "none" }}>
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div style={C.card}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px", color: "#e7e9f5" }}>
        Reset your password.
      </h1>
      <p style={{ fontSize: 13, color: "#9aa1c0", margin: "0 0 24px" }}>
        Enter your email and we&apos;ll send you a link to set a new one.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <label style={{ display: "grid", gap: 5 }}>
          <span style={C.label}>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={C.input}
          />
        </label>

        {error && <div style={{ fontSize: 12.5, color: "#fb7185" }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ ...C.button, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p style={{ marginTop: 22, fontSize: 12.5, color: "#9aa1c0", textAlign: "center" }}>
        <Link href="/login" style={{ color: "#e7e9f5" }}>Back to log in</Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0b14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Link
        href="/"
        style={{
          marginBottom: 28,
          fontSize: 15,
          fontWeight: 700,
          color: "#e7e9f5",
          textDecoration: "none",
          letterSpacing: "-0.01em",
        }}
      >
        ✦ vizstudio
      </Link>
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </main>
  );
}
