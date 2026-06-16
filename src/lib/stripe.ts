import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Don't throw during build/dev if unset - allow the app to boot
  // and surface a user-facing error at purchase time instead.
  console.warn("[stripe] STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2024-10-28.acacia" as Stripe.LatestApiVersion,
  typescript: true,
  appInfo: { name: "vizstudio", version: "0.1.0" },
});

export function priceIdToTier(priceId: string): "PRO" | "TEAM" | "FREE" {
  if (
    priceId === process.env.STRIPE_PRICE_TEAM_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_TEAM_YEARLY
  ) {
    return "TEAM";
  }
  // PRO is the only plan sold through the public checkout and the payment links,
  // so any non-TEAM paid price maps to PRO. This also covers payment-link price
  // IDs that aren't mirrored into the STRIPE_PRICE_PRO_* env vars.
  return "PRO";
}


/* ──────────────────────────────────────────────────────────────────────────
 * Shared Stripe configuration
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Stripe Payment Link URLs per plan. Payment Links are hosted by Stripe and
 * require no secret key, so the upgrade buttons that use them can never hit the
 * "/pricing?checkout=unavailable" failure. Defaults are the TEST-mode links;
 * set the env vars to LIVE Payment Link URLs to take real payments.
 */
export const PAYMENT_LINKS: Record<"PRO_MONTHLY" | "PRO_YEARLY", string> = {
  PRO_MONTHLY: process.env.STRIPE_LINK_PRO_MONTHLY || "https://buy.stripe.com/test_5kQ4gy9bM5wn7Qd0638k800",
  PRO_YEARLY:  process.env.STRIPE_LINK_PRO_YEARLY  || "https://buy.stripe.com/test_6oU6oG3Rs8Iz9Ylg518k801",
};

/** Whether the configured Payment Links are test, live, or a mix. */
export function paymentLinksMode(): "live" | "test" | "mixed" {
  const vals = Object.values(PAYMENT_LINKS);
  const allTest = vals.every((v) => v.includes("/test_"));
  const allLive = vals.every((v) => !v.includes("/test_"));
  return allTest ? "test" : allLive ? "live" : "mixed";
}

/**
 * Price IDs for the API-checkout route (kept for the optional /api/stripe/checkout
 * fallback and for the diagnostics endpoint). Not secrets; env vars take
 * precedence so live-mode IDs can be swapped in without a code change.
 */
export const PRICE_MAP: Record<string, string | undefined> = {
  PRO_MONTHLY:  process.env.STRIPE_PRICE_PRO_MONTHLY || "price_1TioMFB8yLmXHsnznRUeZY2Y",
  PRO_YEARLY:   process.env.STRIPE_PRICE_PRO_YEARLY  || "price_1TioMFB8yLmXHsnz1t3ZNj3U",
  TEAM_MONTHLY: process.env.STRIPE_PRICE_TEAM_MONTHLY,
  TEAM_YEARLY:  process.env.STRIPE_PRICE_TEAM_YEARLY,
};

/** True only when a real-looking secret key is set (not a dev placeholder). */
export function hasStripeSecret(): boolean {
  const k = process.env.STRIPE_SECRET_KEY;
  return Boolean(k) && k!.startsWith("sk_") && k !== "sk_test_placeholder" && k !== "sk_test_dummy";
}

/** Mode of the secret key, derived from its prefix (no secret exposed). */
export function stripeKeyMode(): "live" | "test" | "unset" {
  if (!hasStripeSecret()) return "unset";
  return process.env.STRIPE_SECRET_KEY!.startsWith("sk_live_") ? "live" : "test";
}
