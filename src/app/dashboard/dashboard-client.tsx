"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";

type Key = {
  id: string;
  key: string;
  label: string | null;
  createdAt: string;
  lastUsedAt: string | null;
};

export function DashboardClient({
  initialKeys,
  tier,
}: {
  initialKeys: Key[];
  tier: "FREE" | "PRO" | "TEAM";
}) {
  const utils = trpc.useUtils();
  const meQuery = trpc.user.me.useQuery(undefined, {
    initialData: undefined,
    staleTime: 60_000,
  });

  const keys =
    (meQuery.data?.licenseKeys?.map((k) => ({
      id: k.id,
      key: k.key,
      label: k.label,
      createdAt:
        typeof k.createdAt === "string" ? k.createdAt : k.createdAt.toISOString(),
      lastUsedAt:
        (typeof k.lastUsedAt === "string"
          ? k.lastUsedAt
          : k.lastUsedAt?.toISOString()) ?? null,
    })) as Key[] | undefined) ?? initialKeys;

  const max = tier === "TEAM" ? 10 : tier === "PRO" ? 2 : 0;
  const canCreate = keys.length < max;

  const create = trpc.user.createLicenseKey.useMutation({
    onSuccess: () => utils.user.me.invalidate(),
  });
  const revoke = trpc.user.revokeLicenseKey.useMutation({
    onSuccess: () => utils.user.me.invalidate(),
  });

  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(key: string) {
    await navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <section>
      <h2 className="cat-h2 mb-4">
        <span>License keys</span>
        <span className="count">
          {keys.length} / {max === 0 ? "—" : max}
        </span>
        <span className="line" />
      </h2>

      {tier === "FREE" ? (
        <div className="card p-6 text-[13px] text-text-dim">
          License keys are included with Pro and Team.{" "}
          <a href="/pricing" className="text-text underline">
            Upgrade to get one.
          </a>
        </div>
      ) : (
        <>
          {canCreate && (
            <div className="card p-4 mb-4 flex flex-wrap items-end gap-3">
              <label className="grid gap-1 flex-1 min-w-[220px]">
                <span className="text-[10px] uppercase tracking-widest text-muted">
                  Label (optional)
                </span>
                <input
                  type="text"
                  placeholder="e.g. Workspace A"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="bg-bg-1 border border-border rounded px-3 py-2 text-[12.5px] outline-none focus:border-border-2"
                />
              </label>
              <button
                onClick={() => {
                  create.mutate({ label: label || undefined });
                  setLabel("");
                }}
                disabled={create.isPending}
                className="btn btn-primary"
              >
                {create.isPending ? "Creating…" : "Generate key"}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {keys.length === 0 && (
              <div className="card p-6 text-[13px] text-text-dim">
                No license keys yet. Generate one above.
              </div>
            )}
            {keys.map((k) => (
              <div
                key={k.id}
                className="card p-4 flex items-center gap-4 flex-wrap"
              >
                <div className="flex-1 min-w-[240px]">
                  <div className="font-mono text-[13px] text-text select-all">
                    {k.key}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {k.label ?? "—"} · created{" "}
                    {new Date(k.createdAt).toLocaleDateString()}
                    {k.lastUsedAt && (
                      <> · last used {new Date(k.lastUsedAt).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copy(k.key)}
                    className={cn("btn", copied === k.key && "!text-accent-green")}
                  >
                    {copied === k.key ? "Copied ✓" : "Copy"}
                  </button>
                  <button
                    onClick={() => revoke.mutate({ id: k.id })}
                    disabled={revoke.isPending}
                    className="btn !text-accent-rose"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
