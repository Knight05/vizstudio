import type { Subscription } from "@prisma/client";

export type PaymentState =
  | "free"
  | "paid_on_time"
  | "trialing"
  | "past_due"
  | "canceled"
  | "other";

/** Classify a client's payment standing from their subscription row. */
export function paymentState(sub: Subscription | null): PaymentState {
  if (!sub || sub.tier === "FREE") return "free";
  switch (sub.status) {
    case "active":
      return "paid_on_time";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "other"; // incomplete, paused
  }
}

const LABEL: Record<PaymentState, string> = {
  free: "Free",
  paid_on_time: "Paid · on time",
  trialing: "Trialing",
  past_due: "Past due",
  canceled: "Canceled",
  other: "Attention",
};

const DOT: Record<PaymentState, string> = {
  free: "bg-text-dim",
  paid_on_time: "bg-accent-green",
  trialing: "bg-accent-green",
  past_due: "bg-accent-amber",
  canceled: "bg-red-500",
  other: "bg-accent-amber",
};

export function PaymentBadge({ sub }: { sub: Subscription | null }) {
  const state = paymentState(sub);
  return (
    <span className="pill whitespace-nowrap">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[state]}`} />
      {LABEL[state]}
    </span>
  );
}
