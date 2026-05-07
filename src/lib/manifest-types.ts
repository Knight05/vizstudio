export type ChartCategory =
  | "KPI"
  | "Time Series"
  | "Comparison"
  | "Distribution"
  | "Part-to-Whole"
  | "Network & Flow"
  | "Geo"
  | "Marketing & Funnels"
  | "Finance"
  | "Project & Ops"
  | "Specialty";

export type ChartComponent = {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  longDescription: string;
  category: ChartCategory;
  useCases: string[];
  examples: string[];
  tags: string[];
  iconUrl: string;
  resource: {
    js: string;
    config: string;
    css: string;
  };
};

export type Manifest = {
  name: string;
  organization: string;
  description: string;
  logoUrl: string;
  packageUrl: string;
  organizationUrl: string;
  supportUrl: string;
  components: ChartComponent[];
};

export const CATEGORY_ORDER: ChartCategory[] = [
  "KPI",
  "Time Series",
  "Comparison",
  "Distribution",
  "Part-to-Whole",
  "Network & Flow",
  "Marketing & Funnels",
  "Finance",
  "Project & Ops",
  "Geo",
  "Specialty",
];

export function iconFor(chart: ChartComponent): string {
  return `/icons/${chart.id}.png`;
}
