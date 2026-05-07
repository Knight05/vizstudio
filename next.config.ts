import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
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
