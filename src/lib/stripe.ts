import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Don't throw during build/dev if unset — allow the app to boot
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
  if (
    priceId === process.env.STRIPE_PRICE_PRO_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_PRO_YEARLY
  ) {
    return "PRO";
  }
  return "FREE";
}
