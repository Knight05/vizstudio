import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Price IDs are NOT secrets, so we keep known defaults in code. This guarantees
// the PRO plans resolve even if the env vars aren't set in the deploy
// environment (the cause of the "/pricing?checkout=unavailable" fallback).
// Setting the env vars still takes precedence — e.g. swap in live-mode price IDs
// without a code change. (The STRIPE_SECRET_KEY must still be set in the env;
// secrets are never committed.)
const PRICE_MAP: Record<string, string | undefined> = {
  PRO_MONTHLY:  process.env.STRIPE_PRICE_PRO_MONTHLY || "price_1TioMFB8yLmXHsnznRUeZY2Y",
  PRO_YEARLY:   process.env.STRIPE_PRICE_PRO_YEARLY  || "price_1TioMFB8yLmXHsnz1t3ZNj3U",
  TEAM_MONTHLY: process.env.STRIPE_PRICE_TEAM_MONTHLY,
  TEAM_YEARLY:  process.env.STRIPE_PRICE_TEAM_YEARLY,
};

export async function POST(req: NextRequest) {
  const plan = new URL(req.url).searchParams.get("plan") ?? "";
  if (!(plan in PRICE_MAP)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }
  const priceId = PRICE_MAP[plan];
  if (!priceId) {
    // Stripe price IDs not configured yet - degrade to a friendly notice.
    return NextResponse.redirect(new URL("/pricing?checkout=unavailable", req.url), 303);
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.redirect(new URL(`/login?next=/pricing`, req.url), 303);
  }
  const user = session.user;

  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    let customerId = sub?.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: { userId: user.id, stripeCustomerId: customerId },
        update: { stripeCustomerId: customerId },
      });
    }

    // Always redirect back to the domain the request actually came in on
    // (e.g. https://vizstudio.io) rather than trusting NEXT_PUBLIC_APP_URL,
    // which has been mis-set to localhost and bounced paid users off the app.
    const h = await headers();
    const fwdHost = h.get("x-forwarded-host") ?? h.get("host");
    const fwdProto = h.get("x-forwarded-proto") ?? "https";
    const origin = fwdHost
      ? `${fwdProto}://${fwdHost}`
      : process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      // A completed payment lands inside the app on the Billing tab — never the
      // public marketing site.
      success_url: `${origin}/dashboard?tab=billing&checkout=success`,
      cancel_url:  `${origin}/pricing?checkout=cancelled`,
      subscription_data: { metadata: { userId: user.id } },
    });

    if (!checkout.url) {
      throw new Error("Stripe returned no checkout URL");
    }
    return NextResponse.redirect(checkout.url, 303);
  } catch (err) {
    console.error("[stripe.checkout] failed:", err);
    return NextResponse.redirect(new URL("/pricing?checkout=unavailable", req.url), 303);
  }
}
