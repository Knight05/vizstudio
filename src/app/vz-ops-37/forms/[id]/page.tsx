import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin";
import { SubmissionActions } from "./actions";

type Reply = { by: string; at: string; subject: string; body: string };

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const sub = await prisma.formSubmission.findUnique({ where: { id } });
  if (!sub) notFound();

  const payload =
    sub.payload && typeof sub.payload === "object" && !Array.isArray(sub.payload)
      ? (sub.payload as Record<string, unknown>)
      : null;
  const replies: Reply[] = Array.isArray(payload?.adminReplies)
    ? (payload!.adminReplies as Reply[])
    : [];
  const payloadRest = payload
    ? Object.fromEntries(
        Object.entries(payload).filter(([k]) => k !== "adminReplies")
      )
    : null;

  const fields: Array<[string, string | null]> = [
    ["Form", sub.form],
    ["Status", sub.status],
    ["Name", sub.name],
    ["Email", sub.email],
    ["Source", sub.source],
    ["IP", sub.ip],
    ["Received", formatDate(sub.createdAt)],
  ];

  return (
    <section className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/vz-ops-37/forms" className="pill hover:bg-panel-2">
          ← All forms
        </Link>
        <span className="pill">{sub.form}</span>
      </div>

      <div className="card mb-4 p-5">
        <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-[13px]">
          {fields.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-[10px] uppercase tracking-widest text-muted pt-0.5">
                {k}
              </dt>
              <dd>{v ?? "-"}</dd>
            </div>
          ))}
        </dl>
      </div>

      {sub.message && (
        <div className="card mb-4 p-5">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-muted">
            Message
          </div>
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
            {sub.message}
          </p>
        </div>
      )}

      {payloadRest && Object.keys(payloadRest).length > 0 && (
        <div className="card mb-4 p-5">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-muted">
            Full payload
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-[12px] text-text-dim">
            {JSON.stringify(payloadRest, null, 2)}
          </pre>
        </div>
      )}

      {replies.length > 0 && (
        <div className="card mb-4 p-5">
          <div className="mb-3 text-[10px] uppercase tracking-widest text-muted">
            Replies sent
          </div>
          {replies.map((r, i) => (
            <div key={i} className="mb-3 border-l-2 border-panel-2 pl-3 text-[13px]">
              <div className="text-text-dim">
                {r.by} · {formatDate(new Date(r.at))} · <b>{r.subject}</b>
              </div>
              <p className="whitespace-pre-wrap">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      <SubmissionActions
        id={sub.id}
        status={sub.status}
        email={sub.email}
        form={sub.form}
      />
    </section>
  );
}
