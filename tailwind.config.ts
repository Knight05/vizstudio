import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-1": "var(--bg-1)",
        "bg-2": "var(--bg-2)",
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        border: "var(--border)",
        "border-2": "var(--border-2)",
        text: "var(--text)",
        "text-dim": "var(--text-dim)",
        muted: "var(--muted)",
        "muted-2": "var(--muted-2)",
        accent: {
          green: "var(--acc-green)",
          blue: "var(--acc-blue)",
          amber: "var(--acc-amber)",
          rose: "var(--acc-rose)",
          violet: "var(--acc-violet)",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "IBM Plex Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
      fontSize: {
        "2xs": ["10px", "1.2"],
        xs: ["11px", "1.35"],
      },
      maxWidth: {
        "page": "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
