/**
 * Client-side reCAPTCHA v3 helper for React components.
 *
 * - Lazily injects the grecaptcha script (only on pages that ask for it).
 * - `getRecaptchaToken(action)` resolves to a token, or "" when reCAPTCHA
 *   isn't configured / fails to load - callers should always submit anyway
 *   and let the server decide (the server skips verification when no secret
 *   key is configured).
 *
 * The static-site forms (suggest / subscribe, handled by public/assets/
 * forms.js + partials.js) use the equivalent global `window.vzGetRecaptchaToken`
 * defined in app/layout.tsx.
 */

export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

let loadPromise: Promise<Grecaptcha | null> | null = null;

/** Load the grecaptcha script once. Call from useEffect on pages with forms
 *  so the token fetch at submit-time is instant. */
export function preloadRecaptcha(): Promise<Grecaptcha | null> {
  if (typeof window === "undefined" || !RECAPTCHA_SITE_KEY) {
    return Promise.resolve(null);
  }
  if (window.grecaptcha?.execute) return Promise.resolve(window.grecaptcha);
  if (!loadPromise) {
    loadPromise = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(RECAPTCHA_SITE_KEY)}`;
      s.async = true;
      s.onload = () => {
        const g = window.grecaptcha;
        if (g) g.ready(() => resolve(g));
        else resolve(null);
      };
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }
  return loadPromise;
}

/** Mint a v3 token for the given action. Returns "" on any failure. */
export async function getRecaptchaToken(action: string): Promise<string> {
  try {
    const g = await preloadRecaptcha();
    if (!g) return "";
    return await g.execute(RECAPTCHA_SITE_KEY, { action });
  } catch {
    return "";
  }
}
