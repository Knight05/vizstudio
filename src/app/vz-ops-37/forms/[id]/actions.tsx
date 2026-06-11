"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["new", "read", "resolved"] as const;

export function SubmissionActions({
  id,
  status,
  email,
  form,
}: {
  id: string;
  status: string;
  email: string | null;
  form: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [subject, setSubject] = useState(`Re: your ${form} request — Viz Studio`);
  const [body, setBody] = useState("");

  async function setStatus(next: string) {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/forms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else setMsg((await res.json()).error ?? "Failed to update status");
  }

  async function remove() {
    if (!confirm("Delete this submission permanently?")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.push("/vz-ops-37/forms");
    else setMsg((await res.json()).error ?? "Failed to delete");
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/forms/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) {
      setMsg(`Sent to ${data.to}`);
      setShowReply(false);
      setBody("");
      router.refresh();
    } else {
      setMsg(data.error ?? "Failed to send");
    }
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted mr-1">
          Status
        </span>
        {STATUSES.map((s) => (
          <button
            key={s}
            disabled={busy || s === status}
            onClick={() => setStatus(s)}
            className={`pill hover:bg-panel-2 disabled:opacity-50 ${
              s === status ? "bg-panel-2" : ""
            }`}
          >
            {s}
          </button>
        ))}
        <span className="mx-2 h-4 w-px bg-panel-2" />
        {email && (
          <button
            disabled={busy}
            onClick={() => setShowReply((v) => !v)}
            className="pill hover:bg-panel-2"
          >
            {showReply ? "Cancel reply" : "Reply by email"}
          </button>
        )}
        <button
          disabled={busy}
          onClick={remove}
          className="pill ml-auto text-[var(--acc-red,#f87171)] hover:bg-panel-2"
        >
          Delete
        </button>
      </div>

      {showReply && email && (
        <form onSubmit={sendReply} className="mt-4 grid gap-2">
          <div className="text-[12px] text-text-dim">To: {email}</div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="rounded border border-panel-2 bg-transparent px-3 py-2 text-[13px]"
            placeholder="Subject"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={6}
            className="rounded border border-panel-2 bg-transparent px-3 py-2 text-[13px]"
            placeholder="Write your reply…"
          />
          <div>
            <button disabled={busy} className="btn btn-primary !py-2 !px-4 !text-[13px]">
              {busy ? "Sending…" : "Send reply"}
            </button>
          </div>
        </form>
      )}

      {msg && <div className="mt-3 text-[12.5px] text-text-dim">{msg}</div>}
    </div>
  );
}
