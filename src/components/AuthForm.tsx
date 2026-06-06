"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth-client";

// Styled to match the vizstudio static site (dark indigo/violet).
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

/** Throwaway placeholder password — the user sets their real one via the
 *  emailed set-password link after verifying their address. */
function generatePassword(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await signUp.email({
          email,
          password: generatePassword(),
          name,
          company,
          callbackURL: next,
        });
        if (error) throw new Error(error.message ?? "Sign-up failed");
        setCreated(true);
        return;
      } else {
        const { error } = await signIn.email({
          email,
          password,
          callbackURL: next,
        });
        if (error) throw new Error(error.message ?? "Login failed");
      }
      router.replace(next);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div style={C.card}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px", color: "#e7e9f5" }}>
          Check your inbox.
        </h1>
        <p style={{ fontSize: 13, color: "#9aa1c0", margin: "0 0 18px", lineHeight: 1.6 }}>
          We sent a link to <span style={{ color: "#e7e9f5" }}>{email}</span>.
          Open it to verify your email and set your password — then you&apos;re in.
        </p>
        <button type="button" style={C.button} onClick={() => { router.replace(next); router.refresh(); }}>
          Continue to your portal →
        </button>
      </div>
    );
  }

  return (
    <div style={C.card}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px", color: "#e7e9f5" }}>
        {mode === "login" ? "Welcome back." : "Start free."}
      </h1>
      <p style={{ fontSize: 13, color: "#9aa1c0", margin: "0 0 24px" }}>
        {mode === "login"
          ? "Log in to your client portal."
          : "Create your vizstudio account."}
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        {mode === "signup" && (
          <>
            <label style={{ display: "grid", gap: 5 }}>
              <span style={C.label}>Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your name"
                style={C.input}
              />
            </label>
            <label style={{ display: "grid", gap: 5 }}>
              <span style={C.label}>Company</span>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="your company name"
                style={C.input}
              />
            </label>
          </>
        )}
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
        {mode === "login" && (
          <label style={{ display: "grid", gap: 5 }}>
            <span style={C.label}>Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={C.input}
            />
          </label>
        )}

        {mode === "signup" && (
          <p style={{ fontSize: 12, color: "#9aa1c0", margin: 0, lineHeight: 1.5 }}>
            No password needed yet — we&apos;ll email you a link to verify your
            address and set one.
          </p>
        )}

        {error && <div style={{ fontSize: 12.5, color: "#fb7185" }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ ...C.button, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Working…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 22, fontSize: 12.5, color: "#9aa1c0", textAlign: "center" }}>
        {mode === "login" ? (
          <>New here? <Link href="/signup" style={{ color: "#e7e9f5" }}>Create account</Link></>
        ) : (
          <>Already have an account? <Link href="/login" style={{ color: "#e7e9f5" }}>Log in</Link></>
        )}
      </p>
    </div>
  );
}
