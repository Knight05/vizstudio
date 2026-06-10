"use client";

/**
 * Get Started / sign-up form (marketing-styled).
 *
 * Replaces the old approach (raw HTML injected via dangerouslySetInnerHTML +
 * a separately-loaded /assets/gen/get-started-3.js handler). That setup let the
 * browser perform a native GET submit whenever the external script hadn't
 * attached its listener yet - which both leaked form data into the URL
 * (?name=…&email=…) and meant the account was never actually created.
 *
 * Now the submit is handled inline by React (reliable preventDefault), and the
 * <form method="post"> is belt-and-suspenders so even a pre-hydration native
 * submit can never append field data to the URL query string.
 *
 * The request goes to the same-origin Better-Auth endpoint via a relative URL,
 * so it does not depend on NEXT_PUBLIC_APP_URL being set correctly in prod.
 */

import { useState } from "react";

const ROLES = [
  "Analyst / BI",
  "Marketer",
  "Engineer",
  "Product Manager",
  "Executive",
  "Other",
];

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** Throwaway placeholder - the user sets their real password via the emailed
 *  set-password link after verifying their address. */
function randomPassword(): string {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function GetStartedForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; company?: string }>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: typeof errors = {};
    if (!name.trim()) next.name = "Required.";
    if (!email.trim()) next.email = "Required.";
    else if (!isEmail(email.trim())) next.email = "Enter a valid email.";
    if (!company.trim()) next.company = "Required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: randomPassword(),
          company: company.trim(),
          callbackURL: "/dashboard",
        }),
      });

      if (!res.ok) {
        let data: any = {};
        try {
          data = await res.json();
        } catch {}
        let msg =
          (data && (data.message || (data.error && data.error.message))) ||
          "Could not create your account. Please try again.";
        if (/exist|taken|already/i.test(msg)) {
          msg = "An account with this email already exists. Try logging in.";
        }
        setErrors({ email: msg });
        setLoading(false);
        return;
      }

      // Record the lead (incl. role, which isn't a Better-Auth field) for the
      // admin panel. Best-effort - never block the signup success state on it.
      fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: "signup",
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          role: role.trim() || undefined,
          source: "/get-started",
        }),
      }).catch(() => {});

      setDone(true);
    } catch {
      setErrors({ email: "Network error, please try again." });
      setLoading(false);
    }
  }

  return (
    <>
      <div className="blobs">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
      </div>

      <div id="site-nav" />

      <main>
        <section className="form-page">
          <div className="wrap">
            <div className="form-card">
              <div className="form-eyebrow">Get Started</div>
              <h1>Create your account.</h1>
              <p className="sub">
                Start your 14-day free trial, no credit card required. We&apos;ll email you a link to
                verify your address and set your password, then you&apos;re in.
              </p>

              {!done ? (
                <form method="post" onSubmit={handleSubmit} noValidate>
                  <div className={"form-field" + (errors.name ? " err" : "")}>
                    <label htmlFor="su-name">Full name</label>
                    <input
                      id="su-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <span className="err">{errors.name}</span>
                  </div>

                  <div className={"form-field" + (errors.email ? " err" : "")}>
                    <label htmlFor="su-email">Email</label>
                    <input
                      id="su-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="jane@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <span className="hint">We&apos;ll send a link here to set your password.</span>
                    <span className="err">{errors.email}</span>
                  </div>

                  <div className={"form-field" + (errors.company ? " err" : "")}>
                    <label htmlFor="su-company">Company</label>
                    <input
                      id="su-company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      placeholder="Where you work"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                    <span className="err">{errors.company}</span>
                  </div>

                  <div className="form-field">
                    <label htmlFor="su-role">
                      Role{" "}
                      <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <select
                      id="su-role"
                      name="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {ROLES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                    <span className="err" />
                  </div>

                  <div className="form-submit">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Creating account…" : "Create account →"}
                    </button>
                    <div className="micro">
                      By continuing you agree to our{" "}
                      <a href="/terms" style={{ color: "var(--acc-4)" }}>
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" style={{ color: "var(--acc-4)" }}>
                        Privacy Policy
                      </a>
                      .
                    </div>
                  </div>
                </form>
              ) : (
                <div className="form-success on">
                  <div className="check">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2>Check your inbox.</h2>
                  <p>
                    We emailed{email ? <> <strong>{email}</strong></> : " you"} a link to verify your
                    address and set your password. Once your password is set, you can log in to your
                    portal.
                  </p>
                  <a className="btn btn-primary" href="/login">
                    Go to log in →
                  </a>
                  <a className="btn" href="/" style={{ marginTop: 8 }}>
                    ← Back to charts
                  </a>
                </div>
              )}

              <p className="micro" style={{ textAlign: "center", marginTop: 18 }}>
                Already have an account?{" "}
                <a href="/login" style={{ color: "var(--acc-4)" }}>
                  Log in
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <div id="site-footer">
        <footer className="footer-fallback">
          <nav aria-label="Footer">
            <a href="/">Home</a> · <a href="/#library">Charts</a> ·{" "}
            <a href="/get-started">Get Started</a> · <a href="/suggest">Suggest a Chart</a> ·{" "}
            <a href="/privacy">Privacy</a> · <a href="/terms">Terms of Service</a>
          </nav>
          <p>© vizstudio, premium D3 community visualizations for Data Studio.</p>
        </footer>
      </div>
    </>
  );
}
