"use client";

import { useEffect, useMemo, useState } from "react";

type Use = { tag: string; body: string };
type Chart = {
  id: string;
  name: string;
  tagline: string;
  long: string;
  what: string;
  why: string;
  keywords?: string[];
  uses?: Use[];
  category: string;
  catLabel: string;
  [k: string]: unknown;
};
type Category = { key: string; label: string; blurb: string };
type ChartsFile = { categories: Category[]; charts: Chart[] };
type SiteCopy = Record<string, string>;

const COPY_LABELS: Record<string, string> = {
  hero_headline: "Hero headline (HTML allowed)",
  hero_subhead: "Hero subheadline",
  library_heading: "Library section heading",
  library_subhead: "Library section subtext",
  pricing_heading: "Pricing heading",
  pricing_subhead: "Pricing subtext",
  cta_heading: "Bottom CTA heading",
  cta_subhead: "Bottom CTA subtext",
  subscribe_heading: "Subscribe band heading",
  subscribe_subhead: "Subscribe band subtext",
};

const TABS = ["charts", "categories", "site copy"] as const;
type Tab = (typeof TABS)[number];

const inputCls =
  "w-full rounded border border-panel-2 bg-transparent px-3 py-2 text-[13px]";
const labelCls = "mb-1 block text-[10px] uppercase tracking-widest text-muted";

export function ContentEditor() {
  const [tab, setTab] = useState<Tab>("charts");
  const [charts, setCharts] = useState<ChartsFile | null>(null);
  const [chartsSha, setChartsSha] = useState("");
  const [copy, setCopy] = useState<SiteCopy | null>(null);
  const [copySha, setCopySha] = useState("");
  const [sel, setSel] = useState<string>("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, s] = await Promise.all([
          fetch("/api/admin/content?file=charts").then((r) => r.json()),
          fetch("/api/admin/content?file=site-copy").then((r) => r.json()),
        ]);
        if (c.error) throw new Error(c.error);
        if (s.error) throw new Error(s.error);
        setCharts(c.content);
        setChartsSha(c.sha);
        setCopy(s.content);
        setCopySha(s.sha);
        setSel(c.content.charts[0]?.id ?? "");
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, []);

  const chart = useMemo(
    () => charts?.charts.find((c) => c.id === sel) ?? null,
    [charts, sel]
  );
  const filtered = useMemo(
    () =>
      charts?.charts.filter((c) =>
        c.name.toLowerCase().includes(q.toLowerCase())
      ) ?? [],
    [charts, q]
  );

  function patchChart(patch: Partial<Chart>) {
    if (!charts || !chart) return;
    setCharts({
      ...charts,
      charts: charts.charts.map((c) => (c.id === chart.id ? { ...c, ...patch } : c)),
    });
  }

  function patchCategory(key: string, patch: Partial<Category>) {
    if (!charts) return;
    setCharts({
      ...charts,
      categories: charts.categories.map((c) =>
        c.key === key ? { ...c, ...patch } : c
      ),
    });
  }

  async function save(file: "charts" | "site-copy") {
    setBusy(true);
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        file === "charts"
          ? { file, content: charts, sha: chartsSha }
          : { file, content: copy, sha: copySha }
      ),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(data.error ?? "Save failed");
      return;
    }
    if (file === "charts") setChartsSha(data.sha);
    else setCopySha(data.sha);
    setMsg("Committed to GitHub — Vercel is deploying, live in ~2 minutes.");
  }

  if (err && !charts && !copy) {
    return <div className="card p-6 text-[13px] text-text-dim">Error: {err}</div>;
  }
  if (!charts || !copy) {
    return <div className="card p-6 text-[13px] text-text-dim">Loading live content from GitHub…</div>;
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pill hover:bg-panel-2 ${t === tab ? "bg-panel-2" : ""}`}
          >
            {t}
          </button>
        ))}
        <button
          disabled={busy}
          onClick={() => save(tab === "site copy" ? "site-copy" : "charts")}
          className="btn btn-primary ml-auto !py-2 !px-4 !text-[13px]"
        >
          {busy ? "Committing…" : "Save & publish"}
        </button>
      </div>

      {msg && <div className="mb-4 text-[12.5px] text-text-dim">{msg}</div>}
      {err && <div className="mb-4 text-[12.5px] text-[var(--acc-red,#f87171)]">{err}</div>}

      {tab === "charts" && (
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <div className="card p-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search charts…"
              className={`${inputCls} mb-2`}
            />
            <div className="max-h-[60vh] overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSel(c.id)}
                  className={`block w-full rounded px-2 py-1.5 text-left text-[12.5px] hover:bg-panel-2 ${
                    c.id === sel ? "bg-panel-2" : ""
                  }`}
                >
                  {c.name}
                  <span className="ml-2 text-[10px] text-muted">{c.category}</span>
                </button>
              ))}
            </div>
          </div>

          {chart && (
            <div className="card grid gap-4 p-5">
              <div className="text-[11px] text-muted">
                id: {chart.id} · /charts/{chart.id}
              </div>
              <div>
                <label className={labelCls}>Name</label>
                <input
                  className={inputCls}
                  value={chart.name}
                  onChange={(e) => patchChart({ name: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Tagline</label>
                <input
                  className={inputCls}
                  value={chart.tagline}
                  onChange={(e) => patchChart({ tagline: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Long description</label>
                <textarea
                  rows={4}
                  className={inputCls}
                  value={chart.long}
                  onChange={(e) => patchChart({ long: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>What it does</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={chart.what}
                  onChange={(e) => patchChart({ what: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Why it matters</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={chart.why}
                  onChange={(e) => patchChart({ why: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Keywords (comma-separated)</label>
                <input
                  className={inputCls}
                  value={(chart.keywords ?? []).join(", ")}
                  onChange={(e) =>
                    patchChart({
                      keywords: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div>
                <label className={labelCls}>Use cases</label>
                {(chart.uses ?? []).map((u, i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <input
                      className={`${inputCls} !w-36`}
                      value={u.tag}
                      placeholder="Tag"
                      onChange={(e) => {
                        const uses = [...(chart.uses ?? [])];
                        uses[i] = { ...uses[i], tag: e.target.value };
                        patchChart({ uses });
                      }}
                    />
                    <input
                      className={inputCls}
                      value={u.body}
                      placeholder="Description"
                      onChange={(e) => {
                        const uses = [...(chart.uses ?? [])];
                        uses[i] = { ...uses[i], body: e.target.value };
                        patchChart({ uses });
                      }}
                    />
                    <button
                      className="pill hover:bg-panel-2"
                      onClick={() =>
                        patchChart({
                          uses: (chart.uses ?? []).filter((_, j) => j !== i),
                        })
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  className="pill hover:bg-panel-2"
                  onClick={() =>
                    patchChart({ uses: [...(chart.uses ?? []), { tag: "", body: "" }] })
                  }
                >
                  + Add use case
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "categories" && (
        <div className="grid gap-3">
          {charts.categories.map((c) => (
            <div key={c.key} className="card grid gap-2 p-4">
              <div className="text-[11px] text-muted">key: {c.key}</div>
              <div>
                <label className={labelCls}>Label</label>
                <input
                  className={inputCls}
                  value={c.label}
                  onChange={(e) => patchCategory(c.key, { label: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Blurb</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={c.blurb}
                  onChange={(e) => patchCategory(c.key, { blurb: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "site copy" && (
        <div className="grid gap-3">
          {Object.entries(copy).map(([k, v]) => (
            <div key={k} className="card p-4">
              <label className={labelCls}>{COPY_LABELS[k] ?? k}</label>
              <textarea
                rows={v.length > 80 ? 3 : 2}
                className={inputCls}
                value={v}
                onChange={(e) => setCopy({ ...copy, [k]: e.target.value })}
              />
            </div>
          ))}
          <p className="text-[12px] text-muted">
            Changes apply to the homepage. Saving commits to GitHub and triggers a
            Vercel deploy (~2 min).
          </p>
        </div>
      )}
    </section>
  );
}
