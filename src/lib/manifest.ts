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

// ─── Screenshots ─────────────────────────────────────────
// Maps chart id → /screenshots/<seo-file> using the capture manifest CSV.
let screenshotMap: Record<string, string> | null = null;

export function screenshotFor(chartId: string): string | null {
  if (!screenshotMap) {
    screenshotMap = {};
    try {
      const dir = path.join(process.cwd(), "public", "screenshots");
      const csv = fs.readFileSync(path.join(dir, "_screenshot-manifest.csv"), "utf-8");
      for (const line of csv.split("\n").slice(1)) {
        const cols = line.split(",");
        const folder = cols[2]?.trim();
        const file = cols[3]?.trim();
        if (!folder || !file) continue;
        const webp = file.replace(/\.png$/, ".webp");
        screenshotMap[folder] = `/screenshots/${
          fs.existsSync(path.join(dir, webp)) ? webp : file
        }`;
      }
    } catch {
      // screenshots not available — cards fall back to icons
    }
  }
  return screenshotMap[chartId] ?? null;
}
