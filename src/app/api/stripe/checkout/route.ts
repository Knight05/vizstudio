import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, PRICE_MAP, hasStripeSecret } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * POST /api/stripe/checkout?plan=PRO_MONTHLY&from=dashboard
 *
 * API-based Stripe Checkout (creates a customer + session). This is the LEGACY
 * fallback - the upgrade buttons now use /api/stripe/upgrade (Payment Links),
 * which needs no secret key. Kept so a real STRIPE_SECRET_KEY can drive a fully
 * integrated checkout if desired.
 *
 * On any failure we redirect back to where the user started (the dashboard
 * Billing tab for signed-in users, otherwise /pricing) with a non-secret
 * `reason` code in the URL so the cause is visible.
 */
export const dynamic = "force-dynamic";

function failRedirect(req: NextRequest, from: string, reason: string) {
  const base = from === "dashboard" ? "/dashboard?tab=billing" : "/pricing";
  const sep = base.includes("?") ? "&" : "?";
  const safe = encodeURIComponent(reason).slice(0, 60);
  return NextResponse.redirect(
    new URL(`${base}${sep}checkout=unavailable&reason=${safe}`, req.url),
    303,
  );
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const plan = url.searchParams.get("plan") ?? "";
  const from = url.searchParams.get("from") ?? "";

  if (!(plan in PRICE_MAP)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }
  const priceId = PRICE_MAP[plan];
  if (!priceId) return failRedirect(req, from, "no_price");

  if (!hasStripeSecret()) {
    console.error("[stripe.checkout] STRIPE_SECRET_KEY is not set in this environment");
    return failRedirect(req, from, "no_key");
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    const next = from === "dashboard" ? "/dashboard?tab=billing" : "/pricing";
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, req.url), 303);
  }
  const user = session.user;

  try {
    const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
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

    const h = await headers();
    const fwdHost = h.get("x-forwarded-host") ?? h.get("host");
    const fwdProto = h.get("x-forwarded-proto") ?? "https";
    const origin = fwdHost
      ? `${fwdProto}://${fwdHost}`
      : process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

    const cancelPath =
      from === "dashboard"
        ? "/dashboard?tab=billing&checkout=cancelled"
        : "/pricing?checkout=cancelled";

    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?tab=billing&checkout=success`,
      cancel_url: `${origin}${cancelPath}`,
      subscription_data: { metadata: { userId: user.id } },
    });

    if (!checkout.url) throw new Error("Stripe returned no checkout URL");
    return NextResponse.redirect(checkout.url, 303);
  } catch (err) {
    const e = err as { code?: string; type?: string; message?: string };
    const reason = e.code ?? e.type ?? "stripe_error";
    console.error("[stripe.checkout] failed:", reason, e.message ?? err);
    return failRedirect(req, from, reason);
  }
}
