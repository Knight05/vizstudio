"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
          callbackURL: next,
        });
        if (error) throw new Error(error.message ?? "Sign-up failed");
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

  async function withProvider(provider: "google" | "github") {
    setLoading(true);
    try {
      await signIn.social({ provider, callbackURL: next });
    } catch (err: any) {
      setError(err?.message ?? "OAuth failed.");
      setLoading(false);
    }
  }

  return (
    <div className="card p-8">
      <h1 className="font-sans text-2xl font-semibold tracking-tight mb-1">
        {mode === "login" ? "Welcome back." : "Start free."}
      </h1>
      <p className="text-[12.5px] text-text-dim mb-6">
        {mode === "login"
          ? "Log in to manage your subscription and license keys."
          : "14-day trial. No credit card required."}
      </p>

      <div className="grid gap-2 mb-5">
        <button
          onClick={() => withProvider("google")}
          disabled={loading}
          className="btn w-full justify-center"
        >
          Continue with Google
        </button>
        <button
          onClick={() => withProvider("github")}
          disabled={loading}
          className="btn w-full justify-center"
        >
          Continue with GitHub
        </button>
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
          <span className="px-2 bg-panel text-muted">or email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3">
        {mode === "signup" && (
          <label className="grid gap-1">
            <span className="text-[11px] text-muted uppercase tracking-widest">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="optional"
              className="bg-bg-1 border border-border rounded px-3 py-2 text-[13px] text-text outline-none focus:border-border-2"
            />
          </label>
        )}
        <label className="grid gap-1">
          <span className="text-[11px] text-muted uppercase tracking-widest">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-bg-1 border border-border rounded px-3 py-2 text-[13px] text-text outline-none focus:border-border-2"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-[11px] text-muted uppercase tracking-widest">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-bg-1 border border-border rounded px-3 py-2 text-[13px] text-text outline-none focus:border-border-2"
          />
        </label>

        {error && <div className="text-[12px] text-accent-rose">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full justify-center mt-2 disabled:opacity-60"
        >
          {loading ? "Working…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-[12px] text-text-dim text-center">
        {mode === "login" ? (
          <>New here? <Link href="/signup" className="text-text underline">Create account</Link></>
        ) : (
          <>Already have an account? <Link href="/login" className="text-text underline">Log in</Link></>
        )}
      </p>
    </div>
  );
}
