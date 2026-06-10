/**
 * Server-side reCAPTCHA v3 verification (siteverify).
 *
 * Used by /api/forms. The Better-Auth endpoints (/sign-up, /sign-in,
 * /request-password-reset) are protected separately via Better-Auth's
 * built-in `captcha` plugin - see lib/auth.ts.
 *
 * Graceful degradation: if RECAPTCHA_SECRET_KEY is not configured, every
 * check passes (so local dev and pre-key deploys keep working). If Google's
 * siteverify endpoint itself is unreachable, we fail open rather than
 * blocking real users on a Google outage.
 */

const SECRET = process.env.RECAPTCHA_SECRET_KEY;
const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const DEFAULT_MIN_SCORE = 0.5;

export interface RecaptchaResult {
  ok: boolean;
  score?: number;
  skipped?: boolean;
  reason?: string;
}

export function recaptchaEnabled(): boolean {
  return Boolean(SECRET);
}

export async function verifyRecaptcha(
  token: string | undefined | null,
  opts: { action?: string; ip?: string; minScore?: number } = {},
): Promise<RecaptchaResult> {
  if (!SECRET) return { ok: true, skipped: true };
  if (!token) return { ok: false, reason: "missing-token" };

  const params = new URLSearchParams({ secret: SECRET, response: token });
  if (opts.ip) params.set("remoteip", opts.ip);

  let data: {
    success?: boolean;
    score?: number;
    action?: string;
    "error-codes"?: string[];
  };
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      // Don't hang the request forever if Google is slow.
      signal: AbortSignal.timeout(5000),
    });
    data = (await res.json()) as typeof data;
  } catch {
    // Network failure verifying - fail open so a Google outage never takes
    // our forms down. Bots are still throttled by the per-IP rate limits.
    return { ok: true, skipped: true, reason: "siteverify-unreachable" };
  }

  if (!data.success) {
    return { ok: false, reason: (data["error-codes"] ?? []).join(",") || "failed" };
  }

  const minScore = opts.minScore ?? DEFAULT_MIN_SCORE;
  if (typeof data.score === "number" && data.score < minScore) {
    return { ok: false, score: data.score, reason: "low-score" };
  }

  // v3 tokens carry the action they were minted for - reject mismatches
  // (stops token reuse across forms).
  if (opts.action && data.action && data.action !== opts.action) {
    return { ok: false, score: data.score, reason: "action-mismatch" };
  }

  return { ok: true, score: data.score };
}
