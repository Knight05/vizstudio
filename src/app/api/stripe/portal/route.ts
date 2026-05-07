import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url), 303);
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (!sub?.stripeCustomerId) {
    return NextResponse.redirect(new URL("/pricing", req.url), 303);
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${origin}/dashboard`,
  });
  return NextResponse.redirect(portal.url, 303);
}
