import data from "@/data/charts.json";

export interface UseCase {
  tag: string;
  body: string;
}

export interface RelatedChart {
  id: string;
  name: string;
  tagline: string;
}

export interface Chart {
  id: string;
  name: string;
  tagline: string;
  long: string;
  what: string;
  why: string;
  uses: UseCase[];
  keywords: string;
  category: string;
  catLabel: string;
  screenshot: string | null;
  screenshotWebp: string | null;
  dsLink: string | null;
  related: RelatedChart[];
}

export interface Category {
  key: string;
  label: string;
  blurb: string;
}

const charts = data.charts as Chart[];
const categories = data.categories as Category[];

const bySlug = new Map<string, Chart>(charts.map((c) => [c.id, c]));

export function getAllCharts(): Chart[] {
  return charts;
}

export function getChartSlugs(): string[] {
  return charts.map((c) => c.id);
}

export function getChart(slug: string): Chart | undefined {
  return bySlug.get(slug);
}

export function getCategories(): Category[] {
  return categories;
}

export function getChartsByCategory(key: string): Chart[] {
  return charts.filter((c) => c.category === key);
}
