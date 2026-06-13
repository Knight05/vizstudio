import "server-only";
import type { Subscription } from "@prisma/client";

/**
 * Shared billing math used by the client dashboard and the admin payments
 * views. Everything here is derived from the locally-synced `Subscription`
 * row (kept up to date by the Stripe webhook) — no live Stripe calls — so it
 * is fast and works even when Stripe is unreachable.
 *
 * Canonical pricing (PRO tier): $50 / month, $500 / year.
 * TEAM pricing is read from env if present, else falls back to the same.
 */

export const PRICES = {
  PRO_MONTHLY: 50,
  PRO_YEARLY: 500,
  TEAM_MONTHLY: Number(process.env.TEAM_PRICE_MONTHLY ?? 50),
  TEAM_YEARLY: Number(process.env.TEAM_PRICE_YEARLY ?? 500),
} as const;

export type BillingPeriod = "monthly" | "annual" | null;

/** Monthly vs annual, inferred from the Stripe price id on the row. */
export function billingPeriod(sub: Subscription | null): BillingPeriod {
  const id = sub?.stripePriceId;
  if (!id) return null;
  if (
    id === process.env.STRIPE_PRICE_PRO_YEARLY ||
    id === process.env.STRIPE_PRICE_TEAM_YEARLY
  ) {
    return "annual";
  }
  if (
    id === process.env.STRIPE_PRICE_PRO_MONTHLY ||
    id === process.env.STRIPE_PRICE_TEAM_MONTHLY
  ) {
    return "monthly";
  }
  return null;
}

/** Whether the subscription is currently in a paid, good-standing state. */
export function isPaid(sub: Subscription | null): boolean {
  if (!sub || sub.tier === "FREE") return false;
  return sub.status === "active" || sub.status === "trialing";
}

/**
 * Whole days remaining until the current period ends. Negative means the
 * period already lapsed; null when there is no period on record.
 */
export function daysLeft(sub: Subscription | null): number | null {
  const end = sub?.currentPeriodEnd;
  if (!end) return null;
  const ms = new Date(end).getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

/** Auto-renew is on for a paid sub that is not flagged to cancel at period end. */
export function autoRenews(sub: Subscription | null): boolean {
  return isPaid(sub) && !sub?.cancelAtPeriodEnd;
}

/** The recurring price of this subscription, normalised to a monthly figure. */
export function monthlyValue(sub: Subscription | null): number {
  if (!isPaid(sub) || !sub) return 0;
  const period = billingPeriod(sub);
  const isTeam = sub.tier === "TEAM";
  if (period === "annual") {
    return (isTeam ? PRICES.TEAM_YEARLY : PRICES.PRO_YEARLY) / 12;
  }
  if (period === "monthly") {
    return isTeam ? PRICES.TEAM_MONTHLY : PRICES.PRO_MONTHLY;
  }
  // Unknown period but paid tier — assume monthly list price.
  return isTeam ? PRICES.TEAM_MONTHLY : PRICES.PRO_MONTHLY;
}

export type PaymentStanding = {
  paid: boolean;
  period: BillingPeriod;
  /** Human label, e.g. "Pro · Annual" or "Free trial". */
  planLabel: string;
  daysLeft: number | null;
  autoRenew: boolean;
  /** True when paid but flagged to end at period close. */
  endsAtPeriodEnd: boolean;
  status: string;
  periodEnd: Date | null;
  monthlyValue: number;
};

const TIER_NAME: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  TEAM: "Team",
};

/** One-stop summary of a client's payment standing for display. */
export function paymentStanding(sub: Subscription | null): PaymentStanding {
  const period = billingPeriod(sub);
  const tier = sub?.tier ?? "FREE";
  const paid = isPaid(sub);

  let planLabel = TIER_NAME[tier] ?? tier;
  if (tier === "FREE") {
    planLabel = sub?.status === "trialing" ? "Free trial" : "Free";
  } else if (period) {
    planLabel = `${TIER_NAME[tier]} · ${period === "annual" ? "Annual" : "Monthly"}`;
  }

  return {
    paid,
    period,
    planLabel,
    daysLeft: daysLeft(sub),
    autoRenew: autoRenews(sub),
    endsAtPeriodEnd: paid && !!sub?.cancelAtPeriodEnd,
    status: sub?.status ?? "active",
    periodEnd: sub?.currentPeriodEnd ?? null,
    monthlyValue: monthlyValue(sub),
  };
}

/** Sum monthly recurring revenue across a set of subscriptions. */
export function mrr(subs: (Subscription | null)[]): number {
  return subs.reduce((sum, s) => sum + monthlyValue(s), 0);
}

/** Format a number of cents/dollars as USD. Pass dollars (not cents). */
export function usd(amount: number, opts: { cents?: boolean } = {}): string {
  const value = opts.cents ? amount / 100 : amount;
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
}
