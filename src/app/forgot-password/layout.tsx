import type { Metadata } from "next";

// This page is a client component, so robots metadata lives in this layout.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
