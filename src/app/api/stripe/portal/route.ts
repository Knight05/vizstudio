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

  // Return to the domain the request came in on (vizstudio.io), not a stale
  // NEXT_PUBLIC_APP_URL that could point at localhost.
  const h = await headers();
  const fwdHost = h.get("x-forwarded-host") ?? h.get("host");
  const fwdProto = h.get("x-forwarded-proto") ?? "https";
  const origin = fwdHost
    ? `${fwdProto}://${fwdHost}`
    : process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${origin}/dashboard?tab=billing`,
  });
  return NextResponse.redirect(portal.url, 303);
}
