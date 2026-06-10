import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin";
import { PaymentBadge } from "../payment-status";
import { ChartActions } from "./chart-actions";

const FILTERS = ["all", "paid", "past_due", "trialing", "free"] as const;
type Filter = (typeof FILTERS)[number];

function whereFor(filter: Filter): Prisma.UserWhereInput {
  switch (filter) {
    case "paid":
      return { subscription: { tier: { not: "FREE" }, status: "active" } };
    case "past_due":
      return { subscription: { status: { in: ["past_due", "unpaid"] } } };
    case "trialing":
      return { subscription: { status: "trialing" } };
    case "free":
      return {
        OR: [
          { subscription: null },
          { subscription: { tier: "FREE" } },
        ],
      };
    default:
      return {};
  }
}

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const filter: Filter = FILTERS.includes(sp.filter as Filter)
    ? (sp.filter as Filter)
    : "all";
  const q = sp.q?.trim();

  const where: Prisma.UserWhereInput = {
    ...whereFor(filter),
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const users = await prisma.user.findMany({
    where,
    include: {
      subscription: true,
      _count: { select: { downloads: true, licenseKeys: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/clients" : `/admin/clients?filter=${f}`}
            className={`pill hover:bg-panel-2 ${f === filter ? "bg-panel-2" : ""}`}
          >
            {f.replace("_", " ")}
          </Link>
        ))}
        <form className="ml-auto" action="/admin/clients">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search email or name…"
            className="card px-3 py-1.5 text-[12.5px] bg-transparent outline-none"
          />
        </form>
      </div>

      {users.length === 0 ? (
        <div className="card p-6 text-[13px] text-text-dim">
          No clients match this view.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Renews / ends</th>
                <th className="px-4 py-3">Downloads</th>
                <th className="px-4 py-3">Keys</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Charts</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-panel-2">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.name ?? "-"}</div>
                    <div className="text-text-dim">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">{u.subscription?.tier ?? "FREE"}</td>
                  <td className="px-4 py-3">
                    <PaymentBadge sub={u.subscription} />
                    {u.subscription?.cancelAtPeriodEnd && (
                      <div className="mt-1 text-[11px] text-accent-amber">
                        cancels at period end
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-dim">
                    {u.subscription?.currentPeriodEnd
                      ? formatDate(u.subscription.currentPeriodEnd)
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{u._count.downloads}</td>
                  <td className="px-4 py-3">{u._count.licenseKeys}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-dim">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ChartActions userId={u.id} hasBucket={!!u.gcsBucket} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[11px] text-muted">
        Showing up to 200 most recent. Use search to narrow.
      </p>
    </section>
  );
}
