"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Injects legacy page scripts on every mount so they re-run after client-side
 * (SPA) navigation. The marketing pages were ported from static HTML and rely
 * on imperative scripts (partials.js builds the nav/footer; home-*.js render the
 * D3 charts). `next/script` dedupes by `src`, so those scripts never fire again
 * when you navigate back to the page from, e.g., the dashboard - leaving the nav
 * empty and the charts blank. This component appends fresh <script> elements on
 * each mount with `async = false` so execution order matches a full page load.
 */
export default function ClientScripts({ srcs }: { srcs: string[] }) {
  const pathname = usePathname();
  const key = srcs.join(",");

  useEffect(() => {
    const appended: HTMLScriptElement[] = [];

    for (const src of srcs) {
      const el = document.createElement("script");
      el.src = src;
      // Preserve execution order across the list (d3 before the charts that need it).
      el.async = false;
      el.dataset.clientScript = "1";
      document.body.appendChild(el);
      appended.push(el);
    }

    return () => {
      for (const el of appended) el.remove();
    };
    // Re-run whenever the route changes (covers navigating away and back).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, key]);

  return null;
}
