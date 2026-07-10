"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * GA4 page_view tracking for client-side (soft) navigations.
 *
 * The `gtag('config', ...)` call in layout.tsx sends a page_view on every
 * full page load, but App Router soft navigations (next/link, router.push,
 * dashboard tab changes via query params) never reload the document, so GA4
 * would miss them. This component watches the pathname + search params and
 * sends a page_view for every change AFTER the initial render (the first
 * one is skipped to avoid double-counting the config-driven page_view).
 */
function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      const w = window as unknown as {
        gtag?: (...args: unknown[]) => void;
      };
      if (typeof w.gtag !== "function") return;
      const qs = searchParams?.toString();
      w.gtag("event", "page_view", {
        page_location: window.location.href,
        page_path: qs ? `${pathname}?${qs}` : pathname,
        page_title: document.title,
      });
    } catch {
      /* analytics must never break the page */
    }
  }, [pathname, searchParams]);

  return null;
}

// useSearchParams() requires a Suspense boundary on statically rendered
// routes — without it, next build fails the prerender pass.
export function GAPageView() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
