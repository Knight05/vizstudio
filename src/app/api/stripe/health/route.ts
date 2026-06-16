import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import {
  stripe,
  PRICE_MAP,
  PAYMENT_LINKS,
  hasStripeSecret,
  stripeKeyMode,
  paymentLinksMode,
} from "@/lib/stripe";

/**
 * GET /api/stripe/health  (admin only)
 *
 * Reports exactly what the *running* environment has configured for Stripe,
 * WITHOUT leaking any secret material (only presence booleans + key mode
 * derived from the key prefix, plus non-secret price metadata).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const secretPresent = hasStripeSecret();
  const keyMode = stripeKeyMode();

  const prices: Record<string, unknown> = {};
  let pricesOk = true;
  let priceModeMismatch = false;
  for (const plan of ["PRO_MONTHLY", "PRO_YEARLY"] as const) {
    const id = PRICE_MAP[plan];
    if (!id) {
      prices[plan] = { configured: false };
      pricesOk = false;
      continue;
    }
    if (!secretPresent) {
      prices[plan] = { id, resolved: null, note: "secret key not set - cannot verify" };
      continue;
    }
    try {
      const p = await stripe.prices.retrieve(id);
      if (!p.active) pricesOk = false;
      const priceMode = p.livemode ? "live" : "test";
      if (keyMode !== "unset" && priceMode !== keyMode) priceModeMismatch = true;
      prices[plan] = {
        id,
        resolved: true,
        active: p.active,
        mode: priceMode,
        amount: p.unit_amount,
        currency: p.currency,
        interval: p.recurring?.interval ?? null,
      };
    } catch (err) {
      pricesOk = false;
      const e = err as { code?: string; type?: string; statusCode?: number };
      prices[plan] = { id, resolved: false, error: e.code ?? e.type ?? "unknown", status: e.statusCode ?? null };
    }
  }

  const linksMode = paymentLinksMode();
  const hints: string[] = [];
  if (!secretPresent) {
    hints.push(
      "STRIPE_SECRET_KEY is not set (or is a placeholder). Payment Links still work without it, " +
        "but the webhook and 'Manage billing' portal need a real key to sync subscriptions.",
    );
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    hints.push(
      "STRIPE_WEBHOOK_SECRET is not set - the dashboard will not auto-upgrade to PRO after payment " +
        "until a webhook endpoint (https://vizstudio.io/api/stripe/webhook) is configured and its signing secret is set.",
    );
  }
  if (linksMode === "test") {
    hints.push(
      "Payment Links are in TEST mode - customers can only pay with Stripe test cards (no real money). " +
        "Set STRIPE_LINK_PRO_MONTHLY and STRIPE_LINK_PRO_YEARLY to live Payment Link URLs to charge for real.",
    );
  }
  if (priceModeMismatch) {
    hints.push("Secret key mode and price mode differ (one is live, the other test) - API-route checkout would fail.");
  }

  return NextResponse.json(
    {
      ok: true,
      payment_links: {
        mode: linksMode,
        pro_monthly: PAYMENT_LINKS.PRO_MONTHLY,
        pro_yearly: PAYMENT_LINKS.PRO_YEARLY,
        from_env: {
          pro_monthly: Boolean(process.env.STRIPE_LINK_PRO_MONTHLY),
          pro_yearly: Boolean(process.env.STRIPE_LINK_PRO_YEARLY),
        },
      },
      secret_key: { present: secretPresent, mode: keyMode },
      publishable_key: { present: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) },
      webhook_secret: { present: Boolean(process.env.STRIPE_WEBHOOK_SECRET) },
      prices,
      price_mode_mismatch: priceModeMismatch,
      api_checkout_ready: secretPresent && pricesOk && !priceModeMismatch,
      hints,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
