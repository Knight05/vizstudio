import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const PRICE_MAP: Record<string, string | undefined> = {
  PRO_MONTHLY:  process.env.STRIPE_PRICE_PRO_MONTHLY,
  PRO_YEARLY:   process.env.STRIPE_PRICE_PRO_YEARLY,
  TEAM_MONTHLY: process.env.STRIPE_PRICE_TEAM_MONTHLY,
  TEAM_YEARLY:  process.env.STRIPE_PRICE_TEAM_YEARLY,
};

export async function POST(req: NextRequest) {
  const plan = new URL(req.url).searchParams.get("plan") ?? "";
  const priceId = PRICE_MAP[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.redirect(new URL(`/login?next=/pricing`, req.url), 303);
  }
  const user = session.user;

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

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url:  `${origin}/pricing?checkout=cancelled`,
    subscription_data: { metadata: { userId: user.id } },
  });

  if (!checkout.url) {
    return NextResponse.json({ error: "Stripe returned no URL" }, { status: 500 });
  }
  return NextResponse.redirect(checkout.url, 303);
}
