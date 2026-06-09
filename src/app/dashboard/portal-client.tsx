"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  /** Client's GCS bucket (falls back to the shared library bucket). */
  bucket: string;
  bucketProvisioned: boolean;
  chartCount: number;
};

type PortalChart = {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  description: string;
  useCases?: string[];
  screenshotUrl: string | null;
};

const CAL_CONNECTOR_URL = "/google-calendar-connector";

const TABS = ["overview", "charts", "billing", "downloads", "support", "settings"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Home",
  charts: "Charts",
  billing: "Billing",
  downloads: "Downloads & keys",
  support: "Support",
  settings: "Settings",
};

/* ── SVG icon sprite (from portal mockups) ──────────────── */
function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="i-home" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" d="M2.5 7l5.5-4.5L13.5 7v6.5a1 1 0 0 1-1 1h-3v-4h-3v4h-3a1 1 0 0 1-1-1V7z" /></symbol>
        <symbol id="i-charts" viewBox="0 0 16 16"><rect x="2" y="9" width="3" height="5" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><rect x="6.5" y="5" width="3" height="9" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><rect x="11" y="2" width="3" height="12" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.4" /></symbol>
        <symbol id="i-library" viewBox="0 0 16 16"><rect x="2" y="2" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" /><rect x="8.5" y="2" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" /><rect x="2" y="8.5" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" /><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" /></symbol>
        <symbol id="i-reports" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" /><path fill="none" stroke="currentColor" strokeWidth="1.4" d="M10 2v3h3" /><path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" d="M5 9h6M5 11.5h4" /></symbol>
        <symbol id="i-settings" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" d="M8 1.5v1.5M8 13v1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M1.5 8H3M13 8h1.5M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" /></symbol>
        <symbol id="i-help" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" /><path fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" d="M6.5 6.5a1.5 1.5 0 0 1 3 0c0 1-1.5 1-1.5 2.5" /><circle cx="8" cy="11.5" r="0.6" fill="currentColor" /></symbol>
        <symbol id="i-download" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" d="M8 2v9M4.5 7.5L8 11l3.5-3.5M2.5 13.5h11" /></symbol>
        <symbol id="i-plus" viewBox="0 0 16 16"><path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M8 3v10M3 8h10" /></symbol>
        <symbol id="i-sparkle" viewBox="0 0 16 16"><path fill="currentColor" d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" /></symbol>
        <symbol id="i-bolt" viewBox="0 0 16 16"><path fill="currentColor" d="M9 1L3 9h4l-1 6 6-8H8l1-6z" /></symbol>
        <symbol id="i-data" viewBox="0 0 16 16"><ellipse cx="8" cy="3.5" rx="5" ry="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" /><path fill="none" stroke="currentColor" strokeWidth="1.4" d="M3 3.5v9c0 .9 2.2 1.6 5 1.6s5-.7 5-1.6v-9M3 8c0 .9 2.2 1.6 5 1.6S13 8.9 13 8" /></symbol>
        <symbol id="i-search" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" d="M10.5 10.5L13.5 13.5" /></symbol>
        <symbol id="i-key" viewBox="0 0 16 16"><circle cx="5" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" /><path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" d="M8 8h6M11.5 8v2.5M14 8v2" /></symbol>
        <symbol id="i-cal" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" /></symbol>
      </defs>
    </svg>
  );
}

function Icon({ id }: { id: string }) {
  return (
    <svg width={14} height={14}>
      <use href={`#${id}`} />
    </svg>
  );
}

function StatusPill({ status }: { status: string }) {
  const good =
    status === "active" || status === "trialing" || status === "paid" || status === "verified";
  const bad =
    status === "past_due" || status === "unpaid" || status === "canceled" ||
    status === "failed" || status === "void" || status === "uncollectible";
  return (
    <span className={cn("status-pill", good ? "paid" : bad ? "failed" : "due")}>
      {status.replace("_", " ")}
    </span>
  );
}

function initials(name: string | null, email: string) {
  const src = name?.trim() || email;
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "VZ";
}

/* Copy-to-clipboard field with feedback */
function CopyField({ value, onCopy }: { value: string; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
    onCopy?.();
  }
  return (
    <div className="copy-row">
      <code>{value}</code>
      <button
        className="pbtn"
        style={copied ? { color: "var(--acc-green)" } : undefined}
        onClick={copy}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   Shell
   ════════════════════════════════════════════════════════ */
export function PortalClient(props: PortalProps) {
  const [tab, setTab] = useState<Tab>("overview");

  function switchTab(t: Tab) {
    setTab(t);
    track("portal_tab_view", { tab: t });
  }

  const NAV: { tab: Tab; icon: string; kb?: string }[] = [
    { tab: "overview", icon: "i-home" },
    { tab: "charts", icon: "i-charts", kb: String(props.chartCount) },
    { tab: "billing", icon: "i-reports" },
    { tab: "downloads", icon: "i-download", kb: String(props.initialKeys.length) },
    { tab: "support", icon: "i-help" },
    { tab: "settings", icon: "i-settings" },
  ];

  return (
    <div className="pshell">
      <IconSprite />

      {/* ── sidebar ── */}
      <aside className="psidebar">
        <Link className="sb-brand" href="/">
          <Image src="/logo-256.png" alt="Viz Studio" width={22} height={22} unoptimized />
          vizstudio
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>.io</span>
        </Link>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((n) => (
            <button
              key={n.tab}
              className={cn("sb-link", tab === n.tab && "active")}
              onClick={() => switchTab(n.tab)}
            >
              <Icon id={n.icon} />
              {TAB_LABELS[n.tab]}
              {n.kb && <span className="kb">{n.kb}</span>}
            </button>
          ))}
        </nav>

        <div className="sb-section">Resources</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <a className="sb-link" href={CAL_CONNECTOR_URL} target="_blank" rel="noreferrer">
            <Icon id="i-cal" />
            Calendar connector
          </a>
          <Link className="sb-link" href="/pricing">
            <Icon id="i-bolt" />
            Pricing
          </Link>
        </nav>

        <div className="sb-spacer" />

        <div className="sb-user">
          <div className="sb-user-row">
            <div className="sb-user-avi">{initials(props.user.name, props.user.email)}</div>
            <div>
              <div className="sb-user-name">{props.user.name ?? props.user.email}</div>
              <div className="sb-user-handle">
                {props.tier === "FREE" ? "Free" : props.tier === "PRO" ? "Pro" : "Team"} plan
              </div>
            </div>
          </div>
          {props.tier === "FREE" && (
            <Link href="/pricing" className="sb-user-cta">
              <Icon id="i-sparkle" />
              Upgrade to Pro
            </Link>
          )}
        </div>
      </aside>

      {/* ── main ── */}
      <main className="pmain">
        <div className="topbar">
          <div className="breadcrumbs">
            <span>portal</span>
            <span className="sep">/</span>
            <b>{TAB_LABELS[tab].toLowerCase()}</b>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" title="Support" onClick={() => switchTab("support")}>
              <Icon id="i-help" />
            </button>
            <button className="pbtn-primary" onClick={() => switchTab("charts")}>
              <Icon id="i-plus" />
              New chart
            </button>
          </div>
        </div>

        <div className="workspace">
          {tab === "overview" && <OverviewTab {...props} goTo={switchTab} />}
          {tab === "charts" && <ChartsTab {...props} />}
          {tab === "billing" && <BillingTab {...props} />}
          {tab === "downloads" && <DownloadsTab {...props} />}
          {tab === "support" && <SupportTab />}
          {tab === "settings" && <SettingsTab {...props} />}
        </div>
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   Overview
   ════════════════════════════════════════════════════════ */
function OverviewTab(props: PortalProps & { goTo: (t: Tab) => void }) {
  const first = props.user.name?.split(" ")[0];

  const stats: { label: string; value: string | number; tab: Tab }[] = [
    { label: "Charts", value: props.chartCount, tab: "charts" },
    { label: "Downloads", value: props.downloadCount, tab: "downloads" },
    { label: "License keys", value: props.initialKeys.length, tab: "downloads" },
    { label: "Payment", value: props.status.replace("_", " "), tab: "billing" },
  ];

  return (
    <>
      <div className="page-head">
        <div className="hero-mark">
          <span className="glow" />
          <svg viewBox="0 0 88 88" fill="none">
            <defs>
              <linearGradient id="pg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="0.5" stopColor="#ec4899" />
                <stop offset="1" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <path d="M44 4 L48 40 L84 44 L48 48 L44 84 L40 48 L4 44 L40 40 Z" fill="url(#pg1)" opacity="0.85" />
            <path d="M44 18 L46 42 L70 44 L46 46 L44 70 L42 46 L18 44 L42 42 Z" fill="url(#pg1)" opacity="0.5" transform="rotate(45 44 44)" />
            <circle cx="44" cy="44" r="4" fill="#fff" opacity="0.9" />
          </svg>
        </div>
        <h1>{first ? `Welcome back, ${first}` : "Welcome back"}</h1>
        <p>Your charts, billing, and downloads, all in one place.</p>
      </div>

      <div className="qa-grid">
        <button className="qa-card" onClick={() => props.goTo("charts")}>
          <div className="qa-icon" style={{ background: "color-mix(in oklch, #6366f1 25%, transparent)" }}>
            <svg style={{ color: "#a5b4fc" }}><use href="#i-charts" /></svg>
          </div>
          <div>
            <div className="qa-title">Add a chart</div>
            <div className="qa-body">Browse {props.chartCount} D3-powered visualizations and copy your add-link for Data Studio.</div>
          </div>
          <div className="qa-foot"><span>Open library</span><span>→</span></div>
        </button>
        <button className="qa-card" onClick={() => props.goTo("billing")}>
          <div className="qa-icon" style={{ background: "color-mix(in oklch, #ec4899 25%, transparent)" }}>
            <svg style={{ color: "#f9a8d4" }}><use href="#i-reports" /></svg>
          </div>
          <div>
            <div className="qa-title">Billing & invoices</div>
            <div className="qa-body">Check your plan, update payment details, and download invoices.</div>
          </div>
          <div className="qa-foot"><span>{props.tier} plan</span><span>→</span></div>
        </button>
        <button className="qa-card" onClick={() => props.goTo("support")}>
          <div className="qa-icon" style={{ background: "color-mix(in oklch, #22d3ee 25%, transparent)" }}>
            <svg style={{ color: "#67e8f9" }}><use href="#i-bolt" /></svg>
          </div>
          <div>
            <div className="qa-title">Request a chart</div>
            <div className="qa-body">Need a visualization we don&apos;t have yet? Tell us. We ship fast.</div>
          </div>
          <div className="qa-foot"><span>Support</span><span>→</span></div>
        </button>
      </div>

      {/* quick links: all-charts link, calendar connector */}
      <div className="pcard">
        <h3>Quick links</h3>
        <p className="lead">Everything you need to plug Viz Studio into Data Studio.</p>

        <div className="ql-row">
          <div className="ql-ic"><Icon id="i-library" /></div>
          <div className="ql-main">
            <div className="ql-t">All charts: one manifest</div>
            <div className="ql-s">
              Add the entire library to Data Studio in one go.
            </div>
          </div>
          <div className="ql-act" style={{ flex: 1, minWidth: 260, maxWidth: 420 }}>
            <div style={{ flex: 1 }}>
              {props.bucketProvisioned ? (
                <CopyField
                  value={`gs://${props.bucket}`}
                  onCopy={() => track("library_link_copied", { scope: "all" })}
                />
              ) : (
                <div className="ql-s">
                  Your private library path is being set up. Refresh in a minute.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ql-row">
          <div className="ql-ic"><Icon id="i-cal" /></div>
          <div className="ql-main">
            <div className="ql-t">Google Calendar connector</div>
            <div className="ql-s">Pull calendar events straight into your reports.</div>
          </div>
          <div className="ql-act">
            <a
              className="pbtn"
              style={{ textDecoration: "none" }}
              href={CAL_CONNECTOR_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("calendar_connector_open")}
            >
              Open →
            </a>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <button key={s.label} className="stat" onClick={() => props.goTo(s.tab)}>
            <div className="l">{s.label}</div>
            <div className="v">{s.value}</div>
          </button>
        ))}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════
   Charts library
   ════════════════════════════════════════════════════════ */
function ChartsTab(props: PortalProps) {
  const chartsQuery = trpc.charts.list.useQuery(undefined, { staleTime: 10 * 60_000 });
  const recordDownload = trpc.charts.recordDownload.useMutation();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [sel, setSel] = useState<PortalChart | null>(null);

  // Close modal on Escape
  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  const all = (chartsQuery.data?.components ?? []) as unknown as PortalChart[];
  const cats = Array.from(new Set(all.map((c) => c.category)));

  const needle = q.trim().toLowerCase();
  const filtered = all.filter(
    (c) =>
      (!cat || c.category === cat) &&
      (!needle ||
        c.name.toLowerCase().includes(needle) ||
        c.shortDescription?.toLowerCase().includes(needle) ||
        c.id.includes(needle)),
  );

  function openChart(c: PortalChart) {
    setSel(c);
    track("portal_chart_view", { chart_id: c.id });
  }

  return (
    <>
      <div className="page-head">
        <h1>Chart library</h1>
        <p>
          {props.chartCount} visualizations, ready for Data Studio. Click a chart for
          details and your add-link.{" "}
          <a href="/how-to-add-a-chart" target="_blank" rel="noreferrer" style={{ color: "var(--text)" }}>
            Full how-to guide →
          </a>
        </p>
      </div>

      {/* all-charts banner */}
      <div className="lib-banner">
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="t">Add the entire library</div>
          <div className="s">
            {props.bucketProvisioned
              ? "Paste this manifest path once in Data Studio (Community visualizations → Build your own) and every chart shows up in your report."
              : "Your private library path is being set up. Refresh in a minute and it will appear here."}
          </div>
        </div>
        {props.bucketProvisioned && (
          <div style={{ flex: 1, minWidth: 260, maxWidth: 440 }}>
            <CopyField
              value={`gs://${props.bucket}`}
              onCopy={() => track("library_link_copied", { scope: "all" })}
            />
          </div>
        )}
      </div>

      {/* filters */}
      <div className="filter-row">
        <div className="copy-row" style={{ flex: 1, minWidth: 200, maxWidth: 320, padding: "5px 8px 5px 11px" }}>
          <Icon id="i-search" />
          <input
            className="pinput"
            style={{ border: 0, background: "transparent", padding: "3px 6px" }}
            placeholder="Search charts…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button className={cn("cat-pill", !cat && "on")} onClick={() => setCat(null)}>
          All
        </button>
        {cats.map((c) => (
          <button
            key={c}
            className={cn("cat-pill", cat === c && "on")}
            onClick={() => setCat(cat === c ? null : c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* grid */}
      {chartsQuery.isLoading ? (
        <div className="pcard" style={{ color: "var(--muted)", fontSize: 12.5 }}>
          Loading the library…
        </div>
      ) : filtered.length === 0 ? (
        <div className="pcard" style={{ color: "var(--muted)", fontSize: 12.5 }}>
          No charts match &ldquo;{q}&rdquo;. Try a different search, or{" "}
          <button
            style={{ all: "unset", color: "var(--text)", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => { setQ(""); setCat(null); }}
          >
            clear filters
          </button>.
        </div>
      ) : (
        <div className="chart-grid">
          {filtered.map((c) => (
            <button key={c.id} className="chart-card" onClick={() => openChart(c)}>
              <div className="ic">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/icons/${c.id}.png`} alt="" loading="lazy" />
              </div>
              <div>
                <div className="nm">{c.name}</div>
                <div className="ds">{c.shortDescription || c.description}</div>
              </div>
              <div className="ct">{c.category}</div>
            </button>
          ))}
        </div>
      )}

      {/* detail modal */}
      {sel && (
        <div className="pmodal-ov" onClick={() => setSel(null)}>
          <div className="pmodal" onClick={(e) => e.stopPropagation()}>
            <div className="shot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sel.screenshotUrl ?? `/icons/${sel.id}.png`}
                alt={`${sel.name} screenshot`}
              />
            </div>
            <div className="body">
              <div className="head">
                <div>
                  <h2>{sel.name}</h2>
                  <div className="cat">{sel.category} · {sel.id}</div>
                </div>
                <button className="x" onClick={() => setSel(null)} title="Close">✕</button>
              </div>

              <p className="desc">{sel.longDescription || sel.description}</p>

              <div className="add-box">
                <div className="t">Add to Data Studio</div>
                {props.bucketProvisioned ? (
                  <CopyField
                    value={`gs://${props.bucket}/${sel.id}`}
                    onCopy={() => {
                      track("chart_link_copied", { chart_id: sel.id });
                      recordDownload.mutate({ chartId: sel.id });
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    Your private add-link is being set up. Refresh in a minute.
                  </div>
                )}
                <ol>
                  <li>In your report&apos;s toolbar, open the chart picker → Community visualizations</li>
                  <li>Click &ldquo;+ Explore more&rdquo; → &ldquo;Build your own&rdquo;</li>
                  <li>Paste the manifest path above → Submit</li>
                </ol>
                <a
                  href="/how-to-add-a-chart"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 11.5, color: "var(--text)" }}
                  onClick={() => track("howto_open", { chart_id: sel.id })}
                >
                  Full step-by-step guide →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════
   Billing
   ════════════════════════════════════════════════════════ */
const PLAN_FEATS: Record<PortalProps["tier"], string[]> = {
  FREE: [
    "Preview all charts",
    "Watermarked exports",
    "Community support",
  ],
  PRO: [
    "All charts unlocked",
    "Every palette · no watermark",
    "2 license keys",
    "Priority support",
  ],
  TEAM: [
    "Everything in Pro",
    "10 license keys",
    "Whole-team access",
    "Priority support",
  ],
};

function BillingTab(props: PortalProps) {
  const invoices = trpc.billing.invoices.useQuery(undefined, {
    enabled: props.hasStripeCustomer,
    staleTime: 5 * 60_000,
  });

  const maxKeys = props.tier === "TEAM" ? 10 : props.tier === "PRO" ? 2 : 0;
  const keyPct = maxKeys ? Math.min(100, Math.round((props.initialKeys.length / maxKeys) * 100)) : 0;

  return (
    <>
      <div className="page-head">
        <h1>Billing & usage</h1>
        <p>Manage your plan, monitor usage, and download invoices.</p>
      </div>

      <div className="bill-grid">
        {/* current plan */}
        <div className="pcard">
          <div className="plan-tag">Current plan</div>
          <div className="plan-name" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {props.tier === "FREE" ? "Free" : props.tier === "PRO" ? "Pro" : "Team"}
            <StatusPill status={props.status} />
          </div>
          <div className="plan-price">
            {props.tier === "FREE" ? (
              <><b>$0</b> / month</>
            ) : props.periodEnd ? (
              props.cancelAtPeriodEnd
                ? <>Cancels on <b>{new Date(props.periodEnd).toLocaleDateString()}</b></>
                : <>Renews on <b>{new Date(props.periodEnd).toLocaleDateString()}</b></>
            ) : (
              <>Active subscription</>
            )}
          </div>
          <ul className="plan-feats">
            {PLAN_FEATS[props.tier].map((f) => <li key={f}>{f}</li>)}
          </ul>
          <div className="plan-actions">
            {props.tier === "FREE" ? (
              <>
                <Link href="/pricing" className="primary">Upgrade to Pro →</Link>
                <Link href="/pricing">Compare plans</Link>
              </>
            ) : (
              <>
                {props.hasStripeCustomer && (
                  <form action="/api/stripe/portal" method="POST" style={{ display: "contents" }}>
                    <button type="submit" className="primary" onClick={() => track("billing_portal_open")}>
                      Manage billing →
                    </button>
                  </form>
                )}
                <Link href="/pricing">Change plan</Link>
              </>
            )}
          </div>

          {maxKeys > 0 && (
            <>
              <div className="usage-row">
                <div>
                  <div className="l">License keys</div>
                  <div className="sublabel">{props.initialKeys.length} of {maxKeys} included</div>
                </div>
                <div className="r">{keyPct}%</div>
              </div>
              <div className="usage-bar"><div className="usage-fill" style={{ width: `${keyPct}%` }} /></div>
            </>
          )}
        </div>

        {/* invoices */}
        <div className="pcard">
          <h3>Invoice history</h3>
          <p className="lead">Receipts from your Stripe subscription.</p>

          {!props.hasStripeCustomer ? (
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
              No invoices yet. They&apos;ll appear here after your first payment.
            </div>
          ) : invoices.isLoading ? (
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Loading invoices…</div>
          ) : !invoices.data || invoices.data.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>No invoices yet.</div>
          ) : (
            <table className="invoices">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {invoices.data.map((inv) => (
                  <tr key={inv.id}>
                    <td>{new Date(inv.date).toLocaleDateString()}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 11.5 }}>{inv.number ?? inv.id}</td>
                    <td>
                      {(inv.amount / 100).toLocaleString("en-US", {
                        style: "currency",
                        currency: inv.currency.toUpperCase(),
                      })}
                    </td>
                    <td><StatusPill status={inv.status ?? "open"} /></td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {inv.hostedUrl && (
                        <a href={inv.hostedUrl} target="_blank" rel="noreferrer" className="icon-btn" style={{ display: "inline-grid", border: 0 }} title="View invoice">
                          <Icon id="i-reports" />
                        </a>
                      )}
                      {inv.pdfUrl && (
                        <a href={inv.pdfUrl} className="icon-btn" style={{ display: "inline-grid", border: 0 }} title="Download PDF">
                          <Icon id="i-download" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════
   Downloads & license keys
   ════════════════════════════════════════════════════════ */
function DownloadsTab(props: PortalProps) {
  const utils = trpc.useUtils();
  const meQuery = trpc.user.me.useQuery(undefined, { staleTime: 60_000 });
  const downloadsQuery = trpc.user.downloads.useQuery(undefined, { staleTime: 60_000 });

  const keys: PortalKey[] =
    meQuery.data?.licenseKeys?.map((k) => ({
      id: k.id,
      key: k.key,
      label: k.label,
      createdAt: typeof k.createdAt === "string" ? k.createdAt : k.createdAt.toISOString(),
      lastUsedAt:
        (typeof k.lastUsedAt === "string" ? k.lastUsedAt : k.lastUsedAt?.toISOString()) ?? null,
    })) ?? props.initialKeys;

  const max = props.tier === "TEAM" ? 10 : props.tier === "PRO" ? 2 : 0;
  const canCreate = keys.length < max;

  const create = trpc.user.createLicenseKey.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate();
      setLabel("");
      track("license_key_created");
    },
  });
  const revoke = trpc.user.revokeLicenseKey.useMutation({
    onSuccess: () => utils.user.me.invalidate(),
  });

  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      // Clipboard can be blocked (permissions / insecure context) - no-op.
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Downloads & keys</h1>
        <p>Your license keys and chart download history.</p>
      </div>

      <div className="pcard">
        <h3>License keys</h3>
        <p className="lead">
          {max === 0 ? "Included with Pro and Team plans." : `${keys.length} of ${max} keys in use.`}
        </p>

        {props.tier === "FREE" ? (
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
            License keys unlock watermark-free charts.{" "}
            <Link href="/pricing" style={{ color: "var(--text)" }}>Upgrade to get one.</Link>
          </div>
        ) : (
          <>
            {canCreate && (
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 10, marginBottom: 14 }}>
                <label className="pfield" style={{ flex: 1, minWidth: 220 }}>
                  <span>Label (optional)</span>
                  <input
                    type="text"
                    className="pinput"
                    placeholder="e.g. Workspace A"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </label>
                <button
                  className="pbtn-primary"
                  style={{ padding: "9px 14px" }}
                  onClick={() => create.mutate({ label: label || undefined })}
                  disabled={create.isPending}
                >
                  {create.isPending ? "Creating…" : "Generate key"}
                </button>
              </div>
            )}

            {(create.error || revoke.error) && (
              <div style={{ fontSize: 12.5, color: "var(--acc-rose)", marginBottom: 10 }}>
                {create.error?.message ?? revoke.error?.message}
              </div>
            )}

            {keys.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                No license keys yet. Generate one above.
              </div>
            ) : (
              keys.map((k) => (
                <div key={k.id} className="key-row">
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div className="kkey">{k.key}</div>
                    <div className="kmeta">
                      {k.label ?? "-"} · created {new Date(k.createdAt).toLocaleDateString()}
                      {k.lastUsedAt && <> · last used {new Date(k.lastUsedAt).toLocaleDateString()}</>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="pbtn"
                      style={copied === k.key ? { color: "var(--acc-green)" } : undefined}
                      onClick={() => copy(k.key)}
                    >
                      {copied === k.key ? "Copied ✓" : "Copy"}
                    </button>
                    <button
                      className="pbtn"
                      style={{ color: "var(--acc-rose)" }}
                      onClick={() => revoke.mutate({ id: k.id })}
                      disabled={revoke.isPending}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      <div className="pcard">
        <h3>Download history</h3>
        <p className="lead">Your 50 most recent chart downloads.</p>

        {downloadsQuery.isLoading ? (
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Loading…</div>
        ) : !downloadsQuery.data || downloadsQuery.data.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
            No downloads yet. Open the chart library and copy your first add-link.
          </div>
        ) : (
          <table className="invoices">
            <thead>
              <tr>
                <th>Chart</th>
                <th style={{ textAlign: "right" }}>When</th>
              </tr>
            </thead>
            <tbody>
              {downloadsQuery.data.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{d.chartId}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {new Date(d.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════
   Support
   ════════════════════════════════════════════════════════ */
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

  return (
    <>
      <div className="page-head">
        <h1>Support</h1>
        <p>We read every message and usually reply within one business day.</p>
      </div>

      {sent ? (
        <div className="pcard" style={{ textAlign: "center", padding: 36 }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Message sent ✓</div>
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 18px" }}>
            It&apos;s in the team&apos;s inbox. We&apos;ll get back to you by email.
          </p>
          <button className="pbtn" onClick={() => setSent(false)}>Send another</button>
        </div>
      ) : (
        <div className="pcard" style={{ maxWidth: 640 }}>
          <h3>Contact the team</h3>
          <p className="lead">
            Stuck on a chart? Billing question? Want a visualization we don&apos;t have yet?
          </p>
          <div style={{ display: "grid", gap: 14 }}>
            <label className="pfield">
              <span>Topic</span>
              <select
                className="pinput"
                value={topic}
                onChange={(e) => setTopic(e.target.value as typeof topic)}
              >
                {TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="pfield">
              <span>Message</span>
              <textarea
                className="pinput"
                rows={6}
                style={{ resize: "vertical" }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's going on…"
              />
            </label>
            {submit.error && (
              <div style={{ fontSize: 12, color: "var(--acc-rose)" }}>{submit.error.message}</div>
            )}
            <div>
              <button
                className="pbtn-primary"
                style={{ padding: "9px 16px" }}
                onClick={() => submit.mutate({ topic, message })}
                disabled={submit.isPending || message.trim().length === 0}
              >
                {submit.isPending ? "Sending…" : "Send message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════
   Settings
   ════════════════════════════════════════════════════════ */
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
      router.refresh();
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

  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
        <p>Profile, email, and security.</p>
      </div>

      <div style={{ display: "grid", gap: 14, maxWidth: 640 }}>
        <div className="pcard">
          <h3>Profile</h3>
          <p className="lead">Member since {new Date(props.user.createdAt).toLocaleDateString()}</p>
          <div style={{ display: "grid", gap: 12 }}>
            <label className="pfield">
              <span>Display name</span>
              <input
                type="text"
                className="pinput"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <div>
              <button
                className="pbtn"
                style={nameSaved ? { color: "var(--acc-green)" } : undefined}
                onClick={() => updateProfile.mutate({ name })}
                disabled={updateProfile.isPending || name.trim().length === 0}
              >
                {updateProfile.isPending ? "Saving…" : nameSaved ? "Saved ✓" : "Save name"}
              </button>
            </div>
          </div>
        </div>

        <div className="pcard">
          <h3>Email</h3>
          <p className="lead">
            Current: <span style={{ color: "var(--text)" }}>{props.user.email}</span>{" "}
            <StatusPill status={props.user.emailVerified ? "verified" : "unverified"} />
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            <label className="pfield">
              <span>New email</span>
              <input
                type="email"
                className="pinput"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </label>
            {emailErr && <div style={{ fontSize: 12, color: "var(--acc-rose)" }}>{emailErr}</div>}
            {emailMsg && <div style={{ fontSize: 12, color: "var(--acc-green)" }}>{emailMsg}</div>}
            <div>
              <button className="pbtn" onClick={changeEmail} disabled={emailBusy || !newEmail.includes("@")}>
                {emailBusy ? "Updating…" : "Change email"}
              </button>
            </div>
          </div>
        </div>

        <div className="pcard">
          <h3>Password</h3>
          <p className="lead">Changing your password signs out other sessions.</p>
          <div style={{ display: "grid", gap: 12 }}>
            <label className="pfield">
              <span>Current password</span>
              <input
                type="password"
                className="pinput"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <label className="pfield">
              <span>New password (min 8 characters)</span>
              <input
                type="password"
                className="pinput"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            {pwErr && <div style={{ fontSize: 12, color: "var(--acc-rose)" }}>{pwErr}</div>}
            {pwMsg && <div style={{ fontSize: 12, color: "var(--acc-green)" }}>{pwMsg}</div>}
            <div>
              <button
                className="pbtn"
                onClick={changePassword}
                disabled={pwBusy || currentPw.length === 0 || newPw.length < 8}
              >
                {pwBusy ? "Updating…" : "Change password"}
              </button>
            </div>
          </div>
        </div>

        <div className="pcard">
          <h3>Session</h3>
          <p className="lead">Sign out of the portal on this device.</p>
          <button className="pbtn" style={{ color: "var(--acc-rose)" }} onClick={logOut}>
            Log out
          </button>
        </div>
      </div>
    </>
  );
}
