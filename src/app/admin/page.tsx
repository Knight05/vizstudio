import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    paidSubs,
    pastDue,
    trialing,
    leads,
    forms7d,
    recentForms,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({
      where: { tier: { not: "FREE" }, status: "active" },
    }),
    prisma.subscription.count({
      where: { status: { in: ["past_due", "unpaid"] } },
    }),
    prisma.subscription.count({ where: { status: "trialing" } }),
    prisma.lead.count(),
    prisma.formSubmission.count({ where: { createdAt: { gte: since7d } } }),
    prisma.formSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const freeUsers = totalUsers - paidSubs - pastDue - trialing;

  const stats: Array<{ label: string; value: number; href: string }> = [
    { label: "Clients", value: totalUsers, href: "/admin/clients" },
    { label: "Paid · on time", value: paidSubs, href: "/admin/clients?filter=paid" },
    { label: "Past due", value: pastDue, href: "/admin/clients?filter=past_due" },
    { label: "Trialing", value: trialing, href: "/admin/clients?filter=trialing" },
    { label: "Free", value: Math.max(freeUsers, 0), href: "/admin/clients?filter=free" },
    { label: "Leads", value: leads, href: "/admin/forms?tab=leads" },
    { label: "Forms · 7 days", value: forms7d, href: "/admin/forms" },
  ];

  return (
    <>
      <section className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-4 hover:bg-panel-2">
            <div className="text-[10px] uppercase tracking-widest text-muted mb-1">
              {s.label}
            </div>
            <div className="font-sans text-2xl font-semibold">{s.value}</div>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="cat-h2 mb-4">
          <span>Latest form submissions</span>
          <span className="line" />
        </h2>
        {recentForms.length === 0 ? (
          <div className="card p-6 text-[13px] text-text-dim">
            No submissions yet. Once the site forms are wired to /api/forms,
            they&apos;ll show up here.
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
                  <th className="px-4 py-3">Form</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {recentForms.map((f) => (
                  <tr key={f.id} className="border-t border-panel-2">
                    <td className="px-4 py-3"><span className="pill">{f.form}</span></td>
                    <td className="px-4 py-3">{f.email ?? "—"}</td>
                    <td className="px-4 py-3 max-w-[40ch] truncate text-text-dim">
                      {f.message ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-text-dim">
                      {formatDate(f.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
