"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

// Landing page for the password-setup email (Better-Auth reset flow).
// The email link arrives as /reset-password?token=...

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

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!token) {
      setError("This link is invalid or has expired. Request a new one from the login page.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await authClient.resetPassword({ newPassword: password, token });
      if (error) throw new Error(error.message ?? "Could not set password");
      router.replace("/login?reset=1");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={C.card}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px", color: "#e7e9f5" }}>
        Set your password.
      </h1>
      <p style={{ fontSize: 13, color: "#9aa1c0", margin: "0 0 24px" }}>
        Choose a password for your vizstudio account.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <label style={{ display: "grid", gap: 5 }}>
          <span style={C.label}>New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={C.input}
          />
        </label>
        <label style={{ display: "grid", gap: 5 }}>
          <span style={C.label}>Confirm password</span>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={C.input}
          />
        </label>

        {error && <div style={{ fontSize: 12.5, color: "#fb7185" }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ ...C.button, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Working…" : "Set password"}
        </button>
      </form>

      <p style={{ marginTop: 22, fontSize: 12.5, color: "#9aa1c0", textAlign: "center" }}>
        <Link href="/login" style={{ color: "#e7e9f5" }}>Back to log in</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
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
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
