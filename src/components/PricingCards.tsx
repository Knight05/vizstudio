"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Plan = {
  id: "FREE" | "PRO" | "TEAM";
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  features: string[];
  cta: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    tagline: "The basics, on us.",
    monthly: 0,
    yearly: 0,
    features: [
      "12 starter charts",
      "Unlimited reports",
      "Community support",
      "vizstudio.io watermark",
    ],
    cta: "Start free",
  },
  {
    id: "PRO",
    name: "Pro",
    tagline: "For the analyst who ships.",
    monthly: 19,
    yearly: 15,
    features: [
      "All 118 charts",
      "Unlimited reports",
      "No watermark",
      "Priority email support",
      "2 license keys",
    ],
    cta: "Start Pro trial",
    featured: true,
  },
  {
    id: "TEAM",
    name: "Team",
    tagline: "For the data team.",
    monthly: 59,
    yearly: 49,
    features: [
      "Everything in Pro",
      "10 license keys",
      "SSO (Google Workspace)",
      "Shared theme library",
      "Slack Connect support",
    ],
    cta: "Start Team trial",
  },
];

export function PricingCards({ isAuthed = false }: { isAuthed?: boolean }) {
  const [yearly, setYearly] = useState(true);

  return (
    <section className="border-b border-border" id="pricing">
      <div className="mx-auto max-w-page px-6 py-20">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <h2 className="cat-h2 justify-center">
            <span className="line" />
            <span>Pricing</span>
            <span className="line" />
          </h2>
          <h3 className="font-sans text-3xl md:text-4xl font-semibold tracking-tight">
            Simple pricing. Full library.
          </h3>
          <p className="max-w-[52ch] text-[13px] leading-relaxed text-text-dim font-sans">
            Every plan unlocks every chart. You're paying for support speed,
            team seats, and removing the watermark, not for which charts you see.
          </p>

          <div className="mt-2 inline-flex rounded-full border border-border bg-panel p-1 text-[12px]">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "px-4 py-1.5 rounded-full transition",
                !yearly && "bg-bg text-text",
                yearly && "text-text-dim",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "px-4 py-1.5 rounded-full transition",
                yearly && "bg-bg text-text",
                !yearly && "text-text-dim",
              )}
            >
              Yearly <span className="text-accent-green">· save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly;
            return (
              <div
                key={plan.id}
                className={cn(
                  "card relative flex flex-col p-6",
                  plan.featured && "border-accent-green",
                )}
                style={
                  plan.featured
                    ? { boxShadow: "0 0 0 1px var(--acc-green)" }
                    : undefined
                }
              >
                {plan.featured && (
                  <span
                    className="absolute -top-3 left-6 pill !text-accent-green"
                    style={{ background: "var(--bg)", borderColor: "var(--acc-green)" }}
                  >
                    most popular
                  </span>
                )}
                <div className="mb-4">
                  <div className="font-sans text-xl font-semibold">{plan.name}</div>
                  <div className="text-[12px] text-text-dim mt-0.5">{plan.tagline}</div>
                </div>

                <div className="mb-6 flex items-baseline gap-1.5">
                  <span className="font-sans text-5xl font-bold tracking-tight">
                    ${price}
                  </span>
                  <span className="text-[12px] text-muted">
                    /{yearly ? "mo, billed yearly" : "month"}
                  </span>
                </div>

                <ul className="mb-6 space-y-2 text-[12.5px] text-text-dim">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-accent-green">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <CheckoutButton
                  plan={plan}
                  yearly={yearly}
                  isAuthed={isAuthed}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CheckoutButton({
  plan,
  yearly,
  isAuthed,
}: {
  plan: Plan;
  yearly: boolean;
  isAuthed: boolean;
}) {
  if (plan.id === "FREE") {
    return (
      <Link
        href={isAuthed ? "/dashboard" : "/signup"}
        className="btn w-full justify-center"
      >
        {plan.cta}
      </Link>
    );
  }

  if (!isAuthed) {
    return (
      <Link
        href={`/signup?plan=${plan.id}_${yearly ? "YEARLY" : "MONTHLY"}`}
        className={cn(
          "btn w-full justify-center",
          plan.featured && "btn-primary",
        )}
      >
        {plan.cta} →
      </Link>
    );
  }

  const stripeKey = `${plan.id}_${yearly ? "YEARLY" : "MONTHLY"}` as const;
  return (
    <form action={`/api/stripe/checkout?plan=${stripeKey}`} method="POST">
      <button
        type="submit"
        className={cn(
          "btn w-full justify-center",
          plan.featured && "btn-primary",
        )}
      >
        {plan.cta} →
      </button>
    </form>
  );
}
