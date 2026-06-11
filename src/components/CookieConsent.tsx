"use client";

import { useEffect, useState } from "react";

/**
 * Cookie consent banner + Google Consent Mode v2 bridge.
 *
 * - layout.tsx sets `gtag('consent','default', …denied…)` before GA4 loads,
 *   honoring any previously saved choice from localStorage.
 * - This banner appears only when no choice has been saved yet.
 * - Accept → full consent (analytics + advertising signals), so GA4 audiences
 *   and future remarketing campaigns work without another consent pass.
 *   Decline → everything stays denied (GA4 sends cookieless pings only).
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
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
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
        <p style={S.text}>
          We use cookies to analyze traffic and improve your experience.{" "}
          <a href="/privacy" style={S.link}>
            Privacy Policy
          </a>
        </p>
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
            Accept all
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
    padding: "0 10px 10px",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
  },
  // Slim single-row bar (not a card) so it never buries the page CTAs.
  card: {
    pointerEvents: "auto",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px 12px",
    width: "100%",
    maxWidth: 720,
    background: "rgba(17,19,31,0.96)",
    border: "1px solid rgba(148,163,255,0.18)",
    borderRadius: 10,
    padding: "8px 14px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    fontFamily: "Inter, system-ui, sans-serif",
    backdropFilter: "blur(8px)",
  },
  text: {
    fontSize: 12,
    lineHeight: 1.4,
    color: "#b4bad4",
    margin: 0,
    flex: "1 1 240px",
    minWidth: 0,
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
    borderRadius: 7,
    padding: "6px 14px",
    fontSize: 12.5,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
  },
  btnSecondary: {
    background: "transparent",
    border: "1px solid rgba(148,163,255,0.25)",
    borderRadius: 7,
    padding: "6px 12px",
    fontSize: 12.5,
    fontWeight: 600,
    color: "#c7cbe6",
    cursor: "pointer",
  },
};
