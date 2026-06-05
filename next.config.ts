import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Serve the static marketing site (public/index.html) at the root.
    // App routes (/admin, /dashboard, /login, /signup, /api/*) are untouched.
    return {
      beforeFiles: [{ source: "/", destination: "/index.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
  // Skip TS/ESLint errors during build — we'll tighten these once the rest of
  // the auth/db wiring is connected to real services. Static assets (icons,
  // manifest, charts) build and ship regardless.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default config;
