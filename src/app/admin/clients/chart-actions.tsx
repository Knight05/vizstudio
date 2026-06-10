"use client";

import { useState } from "react";

/**
 * Suspend / Restore a client's live charts.
 * Suspend replaces every script.js in their bucket with a "contact us"
 * placeholder; Restore copies the originals back from the template bucket.
 */
export function ChartActions({ userId, hasBucket }: { userId: string; hasBucket: boolean }) {
  const [busy, setBusy] = useState<"suspend" | "restore" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  if (!hasBucket) return <span className="text-muted">-</span>;

  async function run(action: "suspend" | "restore") {
    const prompt =
      action === "suspend"
        ? "Suspend this client's charts? All their live visualizations will show a 'contact us' placeholder."
        : "Restore this client's charts to the original visualizations?";
    if (!confirm(prompt)) return;

    setBusy(action);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = (await res.json()) as { scripts?: number; error?: string };
      setMsg(
        res.ok
          ? `${action === "suspend" ? "Suspended" : "Restored"} ${data.scripts} charts`
          : data.error ?? "Failed"
      );
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <button
          onClick={() => run("suspend")}
          disabled={!!busy}
          className="pill hover:bg-panel-2 text-accent-amber disabled:opacity-50"
        >
          {busy === "suspend" ? "Suspending…" : "Suspend"}
        </button>
        <button
          onClick={() => run("restore")}
          disabled={!!busy}
          className="pill hover:bg-panel-2 disabled:opacity-50"
        >
          {busy === "restore" ? "Restoring…" : "Restore"}
        </button>
      </div>
      {msg && <span className="text-[11px] text-text-dim">{msg}</span>}
    </div>
  );
}
