import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin";
import {
  paymentStanding,
  mrr,
  usd,
  type PaymentStanding,
} from "@/lib/billing";
import { PaymentBadge } from "../payment-status";

export const metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

const SORTS = ["renewing", "days", "value", "joined"] as const;
type Sort = (typeof SORTS)[number];

const SORT_LABELS: Record<Sort, string> = {
  renewing: "Renewing soon",
  days: "Days left",
  value: "Monthly value",
  joined: "Recently joined",
};

/** Days-left chip with traffic-light colouring. */
function DaysLeft({ s }: { s: PaymentStanding }) {
  if (!s.paid || s.daysLeft === null) {
    return <span className="text-text-dim">—</span>;
  }
  const d = s.daysLeft;
  const color =
    d < 0 ? "text-red-500" : d <= 7 ? "text-accent-amber" : "text-accent-green";
  const label =
    d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "today" : `${d} day${d === 1 ? "" : "s"}`;
  return <span className={`whitespace-nowrap ${color}`}>{label}</span>;
}

function AutoRenew({ s }: { s: PaymentStanding }) {
  if (!s.paid) return <span className="text-text-dim">—</span>;
  return s.autoRenew ? (
    <span className="pill whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
      On
    </span>
  ) : (
    <span className="pill whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" />
      Off
    </span>
  );
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const sort: Sort = SORTS.includes(sp.sort as Sort) ? (sp.sort as Sort) : "renewing";

  // All subscriptions with a paying or previously-paying history, plus the
  // user they belong to. FREE rows are excluded from the payments view.
  const subs = await prisma.subscription.findMany({
    where: { tier: { not: "FREE" } },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const activeSubs = subs.filter((s) => s.status === "active" || s.status === "trialing");
  const monthlyRecurring = mrr(activeSubs);

  const counts = {
    paid: subs.filter((s) => s.status === "active").length,
    trialing: subs.filter((s) => s.status === "trialing").length,
    pastDue: subs.filter((s) => s.status === "past_due" || s.status === "unpaid").length,
    canceled: subs.filter(
      (s) => s.status === "canceled" || s.status === "incomplete_expired",
    ).length,
    autoOff: subs.filter((s) => s.cancelAtPeriodEnd && (s.status === "active" || s.status === "trialing")).length,
  };

  const rows = subs.map((s) => ({
    sub: s,
    user: s.user,
    standing: paymentStanding(s),
  }));

  rows.sort((a, b) => {
    switch (sort) {
      case "days": {
        const av = a.standing.daysLeft ?? Infinity;
        const bv = b.standing.daysLeft ?? Infinity;
        return av - bv;
      }
      case "value":
        return b.standing.monthlyValue - a.standing.monthlyValue;
      case "joined":
        return b.sub.createdAt.getTime() - a.sub.createdAt.getTime();
      case "renewing":
      default: {
        // Auto-renewing soonest first; lapsed/off pushed down.
        const av = a.standing.autoRenew && a.standing.daysLeft !== null ? a.standing.daysLeft : Infinity;
        const bv = b.standing.autoRenew && b.standing.daysLeft !== null ? b.standing.daysLeft : Infinity;
        return av - bv;
      }
    }
  });

  const tiles: Array<{ label: string; value: string; sub?: string }> = [
    { label: "MRR", value: usd(monthlyRecurring), sub: "active + trialing" },
    { label: "ARR", value: usd(monthlyRecurring * 12) },
    { label: "Paid · on time", value: String(counts.paid) },
    { label: "Trialing", value: String(counts.trialing) },
    { label: "Past due", value: String(counts.pastDue) },
    { label: "Auto-renew off", value: String(counts.autoOff) },
  ];

  return (
    <>
      <section className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] mb-8">
        {tiles.map((t) => (
          <div key={t.label} className="card p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted mb-1">
              {t.label}
            </div>
            <div className="font-sans text-2xl font-semibold">{t.value}</div>
            {t.sub && <div className="mt-0.5 text-[11px] text-text-dim">{t.sub}</div>}
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted mr-1">
            Sort
          </span>
          {SORTS.map((sOpt) => (
            <Link
              key={sOpt}
              href={`/vz-ops-37/payments?sort=${sOpt}`}
              className={`pill hover:bg-panel-2 ${sOpt === sort ? "bg-panel-2" : ""}`}
            >
              {SORT_LABELS[sOpt]}
            </Link>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="card p-6 text-[13px] text-text-dim">
            No paid or trialing subscriptions yet. Paying clients appear here
            once their first checkout completes.
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Days left</th>
                  <th className="px-4 py-3">Auto-renew</th>
                  <th className="px-4 py-3">Renews / ends</th>
                  <th className="px-4 py-3">Monthly</th>
                  <th className="px-4 py-3">Stripe</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ sub, user, standing }) => (
                  <tr key={sub.id} className="border-t border-panel-2">
                    <td className="px-4 py-3">
                      <Link href={`/vz-ops-37/clients/${user.id}`} className="group">
                        <div className="font-medium group-hover:underline">
                          {user.name ?? "—"}
                        </div>
                        <div className="text-text-dim">{user.email}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{standing.planLabel}</td>
                    <td className="px-4 py-3"><PaymentBadge sub={sub} /></td>
                    <td className="px-4 py-3"><DaysLeft s={standing} /></td>
                    <td className="px-4 py-3"><AutoRenew s={standing} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-text-dim">
                      {standing.periodEnd ? formatDate(standing.periodEnd) : "—"}
                      {standing.endsAtPeriodEnd && (
                        <div className="text-[11px] text-accent-amber">ends — won&apos;t renew</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {standing.paid ? usd(standing.monthlyValue) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {sub.stripeCustomerId ? (
                        <a
                          className="underline hover:no-underline text-text-dim"
                          href={`https://dashboard.stripe.com/customers/${sub.stripeCustomerId}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          open ↗
                        </a>
                      ) : (
                        <span className="text-text-dim">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[11px] text-muted">
          MRR/ARR are derived from synced subscription state at list prices ($50/mo,
          $500/yr). Open a client in Stripe for exact invoiced amounts.
        </p>
      </section>
    </>
  );
}
