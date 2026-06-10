"use client";

import { useEffect, useState } from "react";

/**
 * Cookie consent banner + Google Consent Mode v2 bridge.
 *
 * - layout.tsx sets `gtag('consent','default', …denied…)` before GA4 loads,
 *   honoring any previously saved choice from localStorage.
 * - This banner appears only when no choice has been saved yet.
 * - Accept → analytics consent granted (GA4 starts setting cookies).
 *   Decline → stays denied (GA4 sends cookieless pings only).
 * - Any element with `data-cookie-settings` or an <a href="#cookie-settings">
 *   (e.g. the footer link) reopens the banner so users can change their mind.
 */

const STORAGE_KEY = "vz_cookie_consent"; // "granted" | "denied"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function applyConsent(value: "granted" | "denied") {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* private mode etc. */
  }
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: value,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    if (value === "granted") {
      window.gtag("event", "cookie_consent_granted");
    }
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (saved !== "granted" && saved !== "denied") setVisible(true);

    // Reopen via footer "Cookie settings" link (works for the static-site
    // footer injected by partials.js too, since this is a delegated listener).
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest?.(
        '[data-cookie-settings], a[href="#cookie-settings"]',
      );
      if (!el) return;
      e.preventDefault();
      setVisible(true);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="Cookie settings" style={S.wrap}>
      <div style={S.card}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div style={S.title}>Cookies &amp; analytics</div>
          <p style={S.text}>
            We use Google Analytics cookies to understand how the site is used
            and improve it. No advertising or cross-site tracking. See our{" "}
            <a href="/privacy" style={S.link}>
              Privacy Policy
            </a>
            .
          </p>
        </div>
        <div style={S.actions}>
          <button
            type="button"
            style={S.btnSecondary}
            onClick={() => {
              applyConsent("denied");
              setVisible(false);
            }}
          >
            Decline
          </button>
          <button
            type="button"
            style={S.btnPrimary}
            onClick={() => {
              applyConsent("granted");
              setVisible(false);
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    padding: "0 16px 16px",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
  },
  card: {
    pointerEvents: "auto",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 720,
    background: "#11131f",
    border: "1px solid rgba(148,163,255,0.18)",
    borderRadius: 14,
    padding: "16px 20px",
    boxShadow: "0 16px 60px rgba(0,0,0,0.55)",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  title: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "#e7e9f5",
    marginBottom: 4,
  },
  text: {
    fontSize: 12.5,
    lineHeight: 1.55,
    color: "#9aa1c0",
    margin: 0,
  },
  link: { color: "#a5b4fc", textDecoration: "underline" },
  actions: {
    display: "flex",
    gap: 8,
    flex: "0 0 auto",
    marginLeft: "auto",
  },
  btnPrimary: {
    background: "linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef)",
    border: "none",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
  },
  btnSecondary: {
    background: "transparent",
    border: "1px solid rgba(148,163,255,0.25)",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 600,
    color: "#c7cbe6",
    cursor: "pointer",
  },
};
