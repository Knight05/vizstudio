// Sample data for live chart demos on vizstudio.io detail pages.
// Keyed by component id. A subset of charts get real demos; the rest
// fall back to a clean placeholder rendered by <LiveChart/>.
window.VZ_SAMPLE = {
  "bar-chart": [
    { feature: "Charts",      users: 9213 },
    { feature: "SQL Editor",  users: 7841 },
    { feature: "Dashboards",  users: 6912 },
    { feature: "Alerts",      users: 4202 },
    { feature: "Exports",     users: 3508 },
    { feature: "Scheduling",  users: 2981 },
    { feature: "Collab",      users: 2410 },
    { feature: "API",         users: 1822 },
  ],
  "stacked-bar": [
    { q: "Q1", mobile: 1800, web: 3400, api: 900 },
    { q: "Q2", mobile: 2300, web: 3100, api: 1100 },
    { q: "Q3", mobile: 2950, web: 2950, api: 1500 },
    { q: "Q4", mobile: 3600, web: 2800, api: 2200 },
  ],
  "line-chart": Array.from({ length: 24 }, (_, i) => ({
    date: new Date(2025, i % 12, (i % 28) + 1),
    revenue: 40000 + Math.sin(i / 3) * 8000 + i * 1200 + Math.random() * 3000,
  })),
  "area-chart": Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2026, 3, i + 1),
    active: 1200 + Math.sin(i / 4) * 200 + i * 12,
  })),
  "pie-chart": [
    { label: "Organic",   value: 41 },
    { label: "Paid",      value: 27 },
    { label: "Referral",  value: 18 },
    { label: "Direct",    value: 14 },
  ],
  "scatter-plot": Array.from({ length: 60 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: 4 + Math.random() * 10,
  })),
  "heatmap": Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      v: Math.random() * 100 + Math.sin(hour / 4) * 30,
    })),
  ).flat(),
  "treemap-chart": {
    name: "root",
    children: [
      { name: "Compute",  value: 4200 },
      { name: "Storage",  value: 2800 },
      { name: "Egress",   value: 1900 },
      { name: "Support",  value: 1100 },
      { name: "Licenses", value:  900 },
      { name: "Other",    value:  600 },
    ],
  },
  "donut-chart": [
    { label: "Free",  value: 2140 },
    { label: "Pro",   value:  860 },
    { label: "Team",  value:  220 },
  ],
  "horizontal-bar": [
    { feature: "Login",     score: 72 },
    { feature: "Onboard",   score: 68 },
    { feature: "Editor",    score: 54 },
    { feature: "Sharing",   score: 47 },
    { feature: "Search",    score: 32 },
  ],
  "sankey-diagram": {
    nodes: [
      { name: "Paid" }, { name: "Organic" }, { name: "Referral" },
      { name: "Trial" }, { name: "Churned" }, { name: "Retained" },
    ],
    links: [
      { source: 0, target: 3, value: 220 },
      { source: 1, target: 3, value: 380 },
      { source: 2, target: 3, value: 140 },
      { source: 3, target: 4, value: 190 },
      { source: 3, target: 5, value: 550 },
    ],
  },
  "kpi-card": { label: "MRR", value: 148200, delta: 0.084, unit: "$" },
};
