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
 *
 * `deferredSrcs` is a second ordered chain for everything below the fold
 * (d3 + topojson + the chart/globe renderers on the home page). It only starts
 * downloading when one of `deferUntil`'s elements gets close to the viewport,
 * with an idle-callback backstop so the content still renders for anyone who
 * never scrolls. Keeping ~380 KB of visualisation JS off the initial chain is
 * what mobile Total Blocking Time actually reacts to.
 */
export default function ClientScripts({
  srcs,
  deferredSrcs,
  deferUntil = "#library, #spotlight",
}: {
  srcs: string[];
  deferredSrcs?: string[];
  deferUntil?: string;
}) {
  const pathname = usePathname();
  const key = srcs.join(",");
  const deferredKey = (deferredSrcs || []).join(",");

  useEffect(() => {
    const appended: HTMLScriptElement[] = [];

    const append = (list: string[]) => {
      for (const src of list) {
        const el = document.createElement("script");
        el.src = src;
        // Preserve execution order across the list (d3 before the charts that need it).
        el.async = false;
        el.dataset.clientScript = "1";
        document.body.appendChild(el);
        appended.push(el);
      }
    };

    append(srcs);

    const deferred = deferredSrcs || [];
    const cleanups: Array<() => void> = [];
    let observer: IntersectionObserver | null = null;
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let started = false;

    const startDeferred = () => {
      if (started) return;
      started = true;
      if (observer) observer.disconnect();
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        (window as unknown as { cancelIdleCallback(id: number): void }).cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) clearTimeout(timerId);
      for (const off of cleanups) off();
      cleanups.length = 0;
      append(deferred);
    };

    if (deferred.length) {
      const targets = Array.from(document.querySelectorAll(deferUntil));
      if (targets.length && typeof IntersectionObserver !== "undefined") {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) startDeferred();
          },
          // Start fetching a screenful before the section scrolls into view.
          // Wide margins defeat the point on a phone, where #spotlight sits
          // barely below the fold.
          { rootMargin: "400px 0px" },
        );
        for (const t of targets) observer.observe(t);

        // Any hint of intent also starts the chain, so it is already warm by
        // the time the section arrives.
        for (const evt of ["scroll", "pointerdown", "keydown"] as const) {
          window.addEventListener(evt, startDeferred, { once: true, passive: true });
          cleanups.push(() => window.removeEventListener(evt, startDeferred));
        }

        // Last-resort backstop so the section still renders for a visitor who
        // never scrolls, and for crawlers and screenshot tools.
        const idle = (
          window as unknown as {
            requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
          }
        ).requestIdleCallback;
        if (idle) idleId = idle(startDeferred, { timeout: 8000 });
        else timerId = setTimeout(startDeferred, 8000);
      } else {
        append(deferred);
      }
    }

    return () => {
      if (observer) observer.disconnect();
      if (timerId !== undefined) clearTimeout(timerId);
      for (const off of cleanups) off();
      for (const el of appended) el.remove();
    };
    // Re-run whenever the route changes (covers navigating away and back).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, key, deferredKey, deferUntil]);

  return null;
}
