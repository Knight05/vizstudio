import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { PAYMENT_LINKS } from "@/lib/stripe";

/**
 * GET|POST /api/stripe/upgrade?plan=PRO_MONTHLY&from=dashboard
 *
 * Sends the signed-in user to the Stripe Payment Link for the chosen plan.
 * Payment Links are hosted by Stripe and need NO secret key, so this path can
 * never fall through to the old "/pricing?checkout=unavailable" error.
 *
 * We attach `client_reference_id` (our userId) and prefill the email so the
 * webhook can map the resulting subscription back to the right account.
 *
 * Going live is an env change, not a code change: set STRIPE_LINK_PRO_MONTHLY
 * and STRIPE_LINK_PRO_YEARLY to your live Payment Link URLs.
 */
export const dynamic = "force-dynamic";

async function handle(req: NextRequest) {
  const url = new URL(req.url);
  const plan = url.searchParams.get("plan") ?? "";
  const from = url.searchParams.get("from") ?? "";
  const backTab = from === "dashboard" ? "/dashboard?tab=billing" : "/pricing";

  const link = PAYMENT_LINKS[plan as keyof typeof PAYMENT_LINKS];
  if (!link) {
    return NextResponse.redirect(
      new URL(`${backTab}${backTab.includes("?") ? "&" : "?"}checkout=unavailable&reason=no_link`, req.url),
      303,
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(backTab)}`, req.url),
      303,
    );
  }

  const dest = new URL(link);
  dest.searchParams.set("client_reference_id", session.user.id);
  if (session.user.email) dest.searchParams.set("prefilled_email", session.user.email);

  return NextResponse.redirect(dest.toString(), 303);
}

export const GET = handle;
export const POST = handle;
