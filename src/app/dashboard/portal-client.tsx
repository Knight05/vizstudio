"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/* ── GA4 helper ─────────────────────────────────────────── */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
function track(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, params);
  }
}

/* ── Types passed from the server component ─────────────── */
export type PortalKey = {
  id: string;
  key: string;
  label: string | null;
  createdAt: string;
  lastUsedAt: string | null;
};

export type PortalProps = {
  user: { name: string | null; email: string; emailVerified: boolean; createdAt: string };
  tier: "FREE" | "PRO" | "TEAM";
  status: string;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasStripeCustomer: boolean;
  initialKeys: PortalKey[];
  favorites: { id: string; chartId: string }[];
  downloadCount: number;
};

const TABS = ["overview", "billing", "downloads", "support", "settings"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  billing: "Billing",
  downloads: "Downloads & keys",
  support: "Support",
  settings: "Settings",
};

function StatusPill({ status }: { status: string }) {
  const good = status === "active" || status === "trialing";
  const bad = status === "past_due" || status === "unpaid" || status === "canceled";
  return (
    <span className="pill">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          good ? "bg-accent-green" : bad ? "bg-accent-rose" : "bg-accent-amber"
        }`}
      />
      {status.replace("_", " ")}
    </span>
  );
}

function SectionH({ title, count }: { title: string; count?: string | number }) {
  return (
    <h2 className="cat-h2 mb-4">
      <span>{title}</span>
      {count !== undefined && <span className="count">{count}</span>}
      <span className="line" />
    </h2>
  );
}

export function PortalClient(props: PortalProps) {
  const [tab, setTab] = useState<Tab>("overview");

  function switchTab(t: Tab) {
    setTab(t);
    track("portal_tab_view", { tab: t });
  }

  return (
    <div>
      {/* Tab nav */}
      <nav className="mb-8 flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={cn("pill hover:bg-panel-2", t === tab && "bg-panel-2 text-text")}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      {tab === "overview" && <OverviewTab {...props} goTo={switchTab} />}
      {tab === "billing" && <BillingTab {...props} />}
      {tab === "downloads" && <DownloadsTab {...props} />}
      {tab === "support" && <SupportTab />}
      {tab === "settings" && <SettingsTab {...props} />}
    </div>
  );
}

/* ── Overview ───────────────────────────────────────────── */
function PlanCard({
  tier,
  status,
  periodEnd,
  cancelAtPeriodEnd,
}: Pick<PortalProps, "tier" | "status" | "periodEnd" | "cancelAtPeriodEnd">) {
  return (
    <section className="card p-6 mb-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h4 className="text-[10px] uppercase tracking-widest text-muted mb-2">
            Current plan
          </h4>
          <div className="flex items-baseline gap-3">
            <span className="font-sans text-3xl font-semibold">{tier}</span>
            <StatusPill status={status} />
          </div>
          {periodEnd && (
            <div className="mt-2 text-[12px] text-text-dim">
              {cancelAtPeriodEnd
                ? `Cancels on ${new Date(periodEnd).toLocaleDateString()}`
                : `Renews on ${new Date(periodEnd).toLocaleDateString()}`}
            </div>
          )}
        </div>
        <div className="text-right">
          {tier === "FREE" ? (
            <Link href="/pricing" className="btn btn-primary">
              Upgrade to Pro →
            </Link>
          ) : (
            <div className="text-[12px] text-text-dim max-w-[32ch]">
              All 118 charts unlocked. Every palette. No watermark.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function OverviewTab(props: PortalProps & { goTo: (t: Tab) => void }) {
  const stats: { label: string; value: string | number; tab: Tab }[] = [
    { label: "Downloads", value: props.downloadCount, tab: "downloads" },
    { label: "License keys", value: props.initialKeys.length, tab: "downloads" },
    { label: "Favorites", value: props.favorites.length, tab: "overview" },
    { label: "Payment", value: props.status.replace("_", " "), tab: "billing" },
  ];

  return (
    <>
      <PlanCard {...props} />

      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 mb-10">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => props.goTo(s.tab)}
            className="card p-4 text-left"
          >
            <div className="text-[10px] uppercase tracking-widest text-muted">
              {s.label}
            </div>
            <div className="font-sans text-xl font-semibold mt-1 capitalize">
              {s.value}
            </div>
          </button>
        ))}
      </div>

      <SectionH title="Favorites" count={props.favorites.length} />
      {props.favorites.length === 0 ? (
        <div className="card p-6 text-[13px] text-text-dim">
          No favorites yet. Browse the{" "}
          <Link href="/showcase" className="text-text underline">
            showcase
          </Link>{" "}
          and star the charts you use most.
        </div>
      ) : (
        <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
          {props.favorites.map((f) => (
            <Link
              key={f.id}
              href={`/charts/${f.chartId}`}
              className="card p-3 text-[12px] text-text hover:bg-panel-2"
            >
              {f.chartId}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Billing ────────────────────────────────────────────── */
function BillingTab(props: PortalProps) {
  const invoices = trpc.billing.invoices.useQuery(undefined, {
    enabled: props.hasStripeCustomer,
    staleTime: 5 * 60_000,
  });

  return (
    <>
      <PlanCard {...props} />

      <div className="mb-10 flex flex-wrap gap-3">
        {props.hasStripeCustomer && (
          <form action="/api/stripe/portal" method="POST">
            <button
              type="submit"
              className="btn"
              onClick={() => track("billing_portal_open")}
            >
              Manage billing →
            </button>
          </form>
        )}
        <Link href="/pricing" className="btn">
          {props.tier === "FREE" ? "View plans" : "Change plan"}
        </Link>
      </div>

      <SectionH title="Invoice history" />
      {!props.hasStripeCustomer ? (
        <div className="card p-6 text-[13px] text-text-dim">
          No invoices yet — they&apos;ll appear here after your first payment.
        </div>
      ) : invoices.isLoading ? (
        <div className="card p-6 text-[13px] text-text-dim">Loading invoices…</div>
      ) : !invoices.data || invoices.data.length === 0 ? (
        <div className="card p-6 text-[13px] text-text-dim">No invoices yet.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.data.map((inv) => (
                <tr key={inv.id} className="border-t border-panel-2">
                  <td className="px-4 py-3 font-mono">{inv.number ?? inv.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-dim">
                    {new Date(inv.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {(inv.amount / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: inv.currency.toUpperCase(),
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={inv.status ?? "open"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inv.hostedUrl && (
                      <a
                        href={inv.hostedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-text underline"
                      >
                        View
                      </a>
                    )}
                    {inv.pdfUrl && (
                      <a
                        href={inv.pdfUrl}
                        className="ml-3 text-text underline"
                      >
                        PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ── Downloads & license keys ───────────────────────────── */
function DownloadsTab(props: PortalProps) {
  const utils = trpc.useUtils();
  const meQuery = trpc.user.me.useQuery(undefined, { staleTime: 60_000 });
  const downloadsQuery = trpc.user.downloads.useQuery(undefined, {
    staleTime: 60_000,
  });

  const keys: PortalKey[] =
    meQuery.data?.licenseKeys?.map((k) => ({
      id: k.id,
      key: k.key,
      label: k.label,
      createdAt:
        typeof k.createdAt === "string" ? k.createdAt : k.createdAt.toISOString(),
      lastUsedAt:
        (typeof k.lastUsedAt === "string"
          ? k.lastUsedAt
          : k.lastUsedAt?.toISOString()) ?? null,
    })) ?? props.initialKeys;

  const max = props.tier === "TEAM" ? 10 : props.tier === "PRO" ? 2 : 0;
  const canCreate = keys.length < max;

  const create = trpc.user.createLicenseKey.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate();
      track("license_key_created");
    },
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
    <>
      <SectionH
        title="License keys"
        count={`${keys.length} / ${max === 0 ? "—" : max}`}
      />

      {props.tier === "FREE" ? (
        <div className="card p-6 text-[13px] text-text-dim mb-10">
          License keys are included with Pro and Team.{" "}
          <Link href="/pricing" className="text-text underline">
            Upgrade to get one.
          </Link>
        </div>
      ) : (
        <div className="mb-10">
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
              <div key={k.id} className="card p-4 flex items-center gap-4 flex-wrap">
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
        </div>
      )}

      <SectionH title="Download history" count={downloadsQuery.data?.length ?? "…"} />
      {downloadsQuery.isLoading ? (
        <div className="card p-6 text-[13px] text-text-dim">Loading…</div>
      ) : !downloadsQuery.data || downloadsQuery.data.length === 0 ? (
        <div className="card p-6 text-[13px] text-text-dim">
          No downloads yet. Head to the{" "}
          <Link href="/showcase" className="text-text underline">
            showcase
          </Link>{" "}
          to grab your first chart.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
                <th className="px-4 py-3">Chart</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {downloadsQuery.data.map((d) => (
                <tr key={d.id} className="border-t border-panel-2">
                  <td className="px-4 py-3">
                    <Link
                      href={`/charts/${d.chartId}`}
                      className="text-text hover:underline"
                    >
                      {d.chartId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-dim">
                    {new Date(d.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ── Support ────────────────────────────────────────────── */
const TOPICS = [
  { value: "support", label: "General support" },
  { value: "billing", label: "Billing question" },
  { value: "chart-request", label: "Request a chart" },
  { value: "bug", label: "Report a bug" },
] as const;

function SupportTab() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]["value"]>("support");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = trpc.user.submitSupport.useMutation({
    onSuccess: () => {
      setSent(true);
      setMessage("");
      track("support_submit", { topic });
    },
  });

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <div className="font-sans text-xl font-semibold mb-2">Message sent ✓</div>
        <p className="text-[13px] text-text-dim mb-5">
          We read every message and usually reply within one business day.
        </p>
        <button className="btn" onClick={() => setSent(false)}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <>
      <SectionH title="Contact support" />
      <div className="card p-6 max-w-2xl">
        <p className="text-[13px] text-text-dim mb-5">
          Stuck on a chart? Billing question? Want a visualization we don&apos;t have
          yet? Drop it here — it goes straight to the team.
        </p>
        <div className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted">
              Topic
            </span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as typeof topic)}
              className="bg-bg-1 border border-border rounded px-3 py-2 text-[12.5px] outline-none focus:border-border-2"
            >
              {TOPICS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted">
              Message
            </span>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's going on…"
              className="bg-bg-1 border border-border rounded px-3 py-2 text-[12.5px] outline-none focus:border-border-2 resize-y"
            />
          </label>
          {submit.error && (
            <div className="text-[12px] text-accent-rose">
              {submit.error.message}
            </div>
          )}
          <div>
            <button
              onClick={() => submit.mutate({ topic, message })}
              disabled={submit.isPending || message.trim().length === 0}
              className="btn btn-primary"
            >
              {submit.isPending ? "Sending…" : "Send message"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Settings ───────────────────────────────────────────── */
function SettingsTab(props: PortalProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Name
  const [name, setName] = useState(props.user.name ?? "");
  const [nameSaved, setNameSaved] = useState(false);
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate();
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 1500);
    },
  });

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);

  async function changeEmail() {
    setEmailMsg(null);
    setEmailErr(null);
    setEmailBusy(true);
    const { error } = await authClient.changeEmail({
      newEmail,
      callbackURL: "/dashboard",
    });
    setEmailBusy(false);
    if (error) {
      setEmailErr(error.message ?? "Could not change email.");
    } else {
      setEmailMsg(
        props.user.emailVerified
          ? "Check your current inbox to confirm the change."
          : "Email updated.",
      );
      setNewEmail("");
      router.refresh();
    }
  }

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  async function changePassword() {
    setPwMsg(null);
    setPwErr(null);
    setPwBusy(true);
    const { error } = await authClient.changePassword({
      currentPassword: currentPw,
      newPassword: newPw,
      revokeOtherSessions: true,
    });
    setPwBusy(false);
    if (error) {
      setPwErr(error.message ?? "Could not change password.");
    } else {
      setPwMsg("Password updated. Other sessions were signed out.");
      setCurrentPw("");
      setNewPw("");
    }
  }

  async function logOut() {
    await authClient.signOut();
    router.push("/login");
  }

  const inputCls =
    "bg-bg-1 border border-border rounded px-3 py-2 text-[12.5px] outline-none focus:border-border-2";

  return (
    <div className="grid gap-8 max-w-2xl">
      <section>
        <SectionH title="Profile" />
        <div className="card p-6 grid gap-4">
          <label className="grid gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted">
              Display name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </label>
          <div>
            <button
              onClick={() => updateProfile.mutate({ name })}
              disabled={updateProfile.isPending || name.trim().length === 0}
              className={cn("btn", nameSaved && "!text-accent-green")}
            >
              {updateProfile.isPending
                ? "Saving…"
                : nameSaved
                  ? "Saved ✓"
                  : "Save name"}
            </button>
          </div>
          <div className="text-[11px] text-muted">
            Member since {new Date(props.user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </section>

      <section>
        <SectionH title="Email" />
        <div className="card p-6 grid gap-4">
          <div className="text-[12.5px] text-text-dim">
            Current: <span className="text-text">{props.user.email}</span>
            {props.user.emailVerified ? (
              <span className="pill ml-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
                verified
              </span>
            ) : (
              <span className="pill ml-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" />
                unverified
              </span>
            )}
          </div>
          <label className="grid gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted">
              New email
            </span>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@company.com"
              className={inputCls}
            />
          </label>
          {emailErr && <div className="text-[12px] text-accent-rose">{emailErr}</div>}
          {emailMsg && <div className="text-[12px] text-accent-green">{emailMsg}</div>}
          <div>
            <button
              onClick={changeEmail}
              disabled={emailBusy || !newEmail.includes("@")}
              className="btn"
            >
              {emailBusy ? "Updating…" : "Change email"}
            </button>
          </div>
        </div>
      </section>

      <section>
        <SectionH title="Password" />
        <div className="card p-6 grid gap-4">
          <label className="grid gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted">
              Current password
            </span>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
              className={inputCls}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted">
              New password (min 8 characters)
            </span>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password"
              className={inputCls}
            />
          </label>
          {pwErr && <div className="text-[12px] text-accent-rose">{pwErr}</div>}
          {pwMsg && <div className="text-[12px] text-accent-green">{pwMsg}</div>}
          <div>
            <button
              onClick={changePassword}
              disabled={pwBusy || currentPw.length === 0 || newPw.length < 8}
              className="btn"
            >
              {pwBusy ? "Updating…" : "Change password"}
            </button>
          </div>
        </div>
      </section>

      <section>
        <SectionH title="Session" />
        <div className="card p-6">
          <button onClick={logOut} className="btn !text-accent-rose">
            Log out
          </button>
        </div>
      </section>
    </div>
  );
}
