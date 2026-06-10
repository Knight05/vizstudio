import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin";

const TABS = ["all", "support", "reportissue", "signup", "suggest", "subscribe", "leads"] as const;
type Tab = (typeof TABS)[number];

export default async function AdminFormsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const tab: Tab = TABS.includes(sp.tab as Tab) ? (sp.tab as Tab) : "all";

  const tabs = (
    <div className="mb-4 flex flex-wrap gap-2">
      {TABS.map((t) => (
        <Link
          key={t}
          href={t === "all" ? "/admin/forms" : `/admin/forms?tab=${t}`}
          className={`pill hover:bg-panel-2 ${t === tab ? "bg-panel-2" : ""}`}
        >
          {t}
        </Link>
      ))}
    </div>
  );

  if (tab === "leads") {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return (
      <section>
        {tabs}
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
                    <td className="px-4 py-3 text-text-dim">{l.source ?? "—"}</td>
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

  const where: Prisma.FormSubmissionWhereInput =
    tab === "all" ? {} : { form: tab };

  const subs = await prisma.formSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <section>
      {tabs}
      {subs.length === 0 ? (
        <div className="card p-6 text-[13px] text-text-dim">
          No submissions yet for this view.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
                <th className="px-4 py-3">Form</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-panel-2 align-top">
                  <td className="px-4 py-3"><span className="pill">{s.form}</span></td>
                  <td className="px-4 py-3">{s.name ?? "—"}</td>
                  <td className="px-4 py-3">{s.email ?? "—"}</td>
                  <td className="px-4 py-3 max-w-[44ch] whitespace-pre-wrap text-text-dim">
                    {(() => {
                      const category =
                        s.payload && typeof s.payload === "object" && !Array.isArray(s.payload)
                          ? (s.payload as Record<string, unknown>).category
                          : undefined;
                      return typeof category === "string" && category ? (
                        <span className="pill mb-1 mr-2 inline-block">{category}</span>
                      ) : null;
                    })()}
                    {s.message ?? "—"}
                  </td>
                  <td className="px-4 py-3 max-w-[24ch] truncate text-text-dim">
                    {s.source ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-dim">
                    {formatDate(s.createdAt)}
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
