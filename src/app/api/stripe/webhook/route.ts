import { NextRequest, NextResponse } from "next/server";
import { stripe, priceIdToTier } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

/** Stripe webhook receiver.
 * Keeps `Subscription` rows in sync when status / plan / period changes.
 * Configure endpoint at https://dashboard.stripe.com/webhooks →
 *   URL: https://yourdomain.com/api/stripe/webhook
 *   Events: checkout.session.completed, customer.subscription.*,
 *           invoice.paid, invoice.payment_failed
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "not configured" }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    console.error("[stripe.webhook] signature verification failed:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.mode === "subscription" && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription as string);
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        if (inv.subscription) {
          const sub = await stripe.subscriptions.retrieve(inv.subscription as string);
          await syncSubscription(sub);
        }
        break;
      }
      default:
        // Unhandled — ack anyway so Stripe doesn't retry.
        break;
    }
  } catch (err) {
    console.error("[stripe.webhook] handler error:", err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(sub: Stripe.Subscription) {
  const userId =
    (sub.metadata?.userId as string | undefined) ??
    (await resolveUserIdByCustomer(sub.customer as string));

  if (!userId) {
    console.warn("[stripe.webhook] could not resolve profile for", sub.id);
    return;
  }

  const priceId = sub.items.data[0]?.price.id ?? null;
  const tier = priceId ? priceIdToTier(priceId) : "FREE";

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      tier,
      status: sub.status as any,
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      tier,
      status: sub.status as any,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

async function resolveUserIdByCustomer(customerId: string) {
  const row = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });
  return row?.userId;
}

