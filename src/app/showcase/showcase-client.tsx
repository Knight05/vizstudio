"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORY_ORDER, type ChartComponent, type ChartCategory } from "@/lib/manifest-types";
import { cn } from "@/lib/utils";

export function ShowcaseClient({
  components,
  totalCount,
}: {
  components: ChartComponent[];
  totalCount: number;
}) {
  const [category, setCategory] = useState<ChartCategory | "All">("All");
  const [search, setSearch] = useState("");

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of components) map.set(c.category, (map.get(c.category) ?? 0) + 1);
    return map;
  }, [components]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return components.filter((c) => {
      if (category !== "All" && c.category !== category) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q) ||
        c.tags.some((t) => t.includes(q))
      );
    });
  }, [components, category, search]);

  const byCat = useMemo(() => {
    const groups = new Map<ChartCategory, ChartComponent[]>();
    for (const c of filtered) {
      const list = groups.get(c.category) ?? [];
      list.push(c);
      groups.set(c.category, list);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="grid md:grid-cols-[220px_1fr] min-h-[calc(100vh-58px)]">
      {/* Sidebar */}
      <aside className="border-r border-border bg-bg-1 p-4 sticky top-[58px] self-start hidden md:block max-h-[calc(100vh-58px)] overflow-y-auto">
        <h4 className="mb-2 px-2 text-[10px] uppercase tracking-widest text-muted">
          Categories
        </h4>
        <ul className="space-y-0.5">
          <CatItem
            active={category === "All"}
            onClick={() => setCategory("All")}
            label="All"
            count={components.length}
          />
          {CATEGORY_ORDER.map((cat) => (
            <CatItem
              key={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
              label={cat}
              count={categoryCounts.get(cat) ?? 0}
            />
          ))}
        </ul>

        <h4 className="mt-6 mb-2 px-2 text-[10px] uppercase tracking-widest text-muted">
          Library
        </h4>
        <div className="px-2 text-[11px] text-text-dim space-y-1">
          <div>{totalCount} charts total</div>
          <div>v2.4 · Apr 2026</div>
        </div>
      </aside>

      {/* Main */}
      <section className="p-6 md:p-8">
        <header className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
          <div>
            <h1 className="font-sans text-2xl md:text-3xl font-semibold tracking-tight">
              Showcase
            </h1>
            <p className="text-[12.5px] text-text-dim mt-1">
              {filtered.length} chart{filtered.length === 1 ? "" : "s"}
              {category !== "All" && <> in <b>{category}</b></>}
              {search && <> matching <b>&ldquo;{search}&rdquo;</b></>}
            </p>
          </div>
          <input
            type="text"
            placeholder="Search charts, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[280px] bg-panel border border-border rounded px-3 py-2 text-[12px] text-text outline-none focus:border-border-2"
          />
        </header>

        {[...byCat.entries()].map(([cat, items]) => (
          <section key={cat} className="mb-10">
            <h2 className="cat-h2 mb-4">
              <span>{cat}</span>
              <span className="count">{items.length}</span>
              <span className="line" />
            </h2>
            <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
              {items.map((c) => (
                <ChartCard key={c.id} chart={c} />
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="card p-16 text-center">
            <div className="text-[14px] text-text-dim">
              No charts match your filters.
            </div>
            <button
              onClick={() => {
                setCategory("All");
                setSearch("");
              }}
              className="btn mt-4"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function CatItem({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] transition text-left",
          active
            ? "bg-panel text-text"
            : "text-text-dim hover:bg-panel hover:text-text",
        )}
      >
        <span>{label}</span>
        <span className="ml-auto text-[10px] text-muted">{count}</span>
      </button>
    </li>
  );
}

function ChartCard({ chart }: { chart: ChartComponent }) {
  return (
    <Link
      href={`/charts/${chart.id}`}
      className="card group block h-[170px] overflow-hidden"
    >
      <div className="flex items-center gap-2 border-b border-border px-2.5 py-1.5">
        <span className="text-[9px] text-muted uppercase tracking-widest truncate">
          {chart.id}
        </span>
        <span className="dot-live ml-auto !w-1.5 !h-1.5" />
      </div>
      <div className="px-2.5 pt-1.5 pb-0">
        <div className="text-[11.5px] text-text font-medium leading-tight line-clamp-1">
          {chart.name}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-2">
        <Image
          src={`/icons/${chart.id}.png`}
          alt={chart.name}
          width={120}
          height={80}
          className="max-h-[72px] w-auto opacity-85 group-hover:opacity-100 transition"
        />
      </div>
    </Link>
  );
}
