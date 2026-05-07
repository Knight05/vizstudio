import "server-only";
import fs from "node:fs";
import path from "node:path";
import {
  type ChartCategory,
  type ChartComponent,
  type Manifest,
} from "./manifest-types";

export {
  type ChartCategory,
  type ChartComponent,
  type Manifest,
  CATEGORY_ORDER,
  iconFor,
} from "./manifest-types";

let cached: Manifest | null = null;

export function loadManifest(): Manifest {
  if (cached) return cached;
  const file = path.join(process.cwd(), "public", "manifest.json");
  const raw = fs.readFileSync(file, "utf-8");
  cached = JSON.parse(raw) as Manifest;
  return cached;
}

export function getChartBySlug(slug: string): ChartComponent | null {
  const manifest = loadManifest();
  return manifest.components.find((c) => c.id === slug) ?? null;
}

export function getChartsByCategory(): Record<ChartCategory, ChartComponent[]> {
  const manifest = loadManifest();
  const out = {} as Record<ChartCategory, ChartComponent[]>;
  for (const c of manifest.components) {
    (out[c.category] ??= []).push(c);
  }
  return out;
}
