import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin";

const TABS = ["all", "support", "reportissue", "signup", "suggest", "subscribe", "leads"] as const;
type Tab = (typeof TABS)[number];

const STATUSES = ["all", "new", "read", "resolved"] as const;
type StatusFilter = (typeof STATUSES)[number];

const STATUS_STYLE: Record<string, string> = {
  new: "text-[var(--acc-green,#4ade80)]",
  read: "text-text-dim",
  resolved: "text-muted line-through",
};

export default async function AdminFormsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const tab: Tab = TABS.includes(sp.tab as Tab) ? (sp.tab as Tab) : "all";
  const status: StatusFilter = STATUSES.includes(sp.status as StatusFilter)
    ? (sp.status as StatusFilter)
    : "all";

  const qs = (t: Tab, s: StatusFilter) => {
    const p = new URLSearchParams();
    if (t !== "all") p.set("tab", t);
    if (s !== "all") p.set("status", s);
    const str = p.toString();
    return str ? `/vz-ops-37/forms?${str}` : "/vz-ops-37/forms";
  };

  const header = (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {TABS.map((t) => (
        <Link
          key={t}
          href={qs(t, status)}
          className={`pill hover:bg-panel-2 ${t === tab ? "bg-panel-2" : ""}`}
        >
          {t}
        </Link>
      ))}
      <span className="mx-1 h-4 w-px bg-panel-2" />
      {tab !== "leads" &&
        STATUSES.map((s) => (
          <Link
            key={s}
            href={qs(tab, s)}
            className={`pill hover:bg-panel-2 ${s === status ? "bg-panel-2" : ""}`}
          >
            {s === "all" ? "any status" : s}
          </Link>
        ))}
      <a
        href={`/api/admin/forms/export?tab=${tab}`}
        className="pill ml-auto hover:bg-panel-2"
      >
        Export CSV ↓
      </a>
    </div>
  );

  if (tab === "leads") {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return (
      <section>
        {header}
        {leads.length === 0 ? (
          <div className="card p-6 text-[13px] text-text-dim">No leads yet.</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-panel-2">
                    <td className="px-4 py-3">{l.email}</td>
                    <td className="px-4 py-3 text-text-dim">{l.source ?? "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-text-dim">
                      {formatDate(l.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  const where: Prisma.FormSubmissionWhereInput = {
    ...(tab === "all" ? {} : { form: tab }),
    ...(status === "all" ? {} : { status }),
  };

  const subs = await prisma.formSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <section>
      {header}
      {subs.length === 0 ? (
        <div className="card p-6 text-[13px] text-text-dim">
          No submissions yet for this view.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Form</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr
                  key={s.id}
                  className={`border-t border-panel-2 align-top ${
                    s.status === "new" ? "font-medium" : ""
                  }`}
                >
                  <td className={`px-4 py-3 ${STATUS_STYLE[s.status] ?? ""}`}>
                    {s.status}
                  </td>
                  <td className="px-4 py-3"><span className="pill">{s.form}</span></td>
                  <td className="px-4 py-3">{s.name ?? "-"}</td>
                  <td className="px-4 py-3">{s.email ?? "-"}</td>
                  <td className="px-4 py-3 max-w-[40ch] truncate text-text-dim">
                    {s.message ?? "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-dim">
                    {formatDate(s.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/vz-ops-37/forms/${s.id}`}
                      className="pill hover:bg-panel-2"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
