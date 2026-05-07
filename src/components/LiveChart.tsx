"use client";

import { useEffect, useRef } from "react";

/**
 * Mount the existing vanilla D3 chart implementations from /public/charts/*.
 * Those files (charts.js, sample-data.js) attach a global CHARTS[slug]
 * function that takes a { mount, data } context and renders into the DOM.
 *
 * Gracefully degrades to a placeholder if the slug isn't wired yet.
 */
declare global {
  interface Window {
    CHARTS?: Record<string, (ctx: any) => void>;
    VZ_SAMPLE?: Record<string, any>;
  }
}

export function LiveChart({ slug, name }: { slug: string; name: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scriptsLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadScripts() {
      if (scriptsLoadedRef.current) return;
      scriptsLoadedRef.current = true;

      await ensureScript("https://d3js.org/d3.v7.min.js", "d3-lib");
      await ensureScript("/charts/sample-data.js", "vz-sample");
      await ensureScript("/charts/charts.js", "vz-charts");
    }

    (async () => {
      try {
        await loadScripts();
        if (cancelled || !mountRef.current) return;
        mountRef.current.innerHTML = "";

        const fn = window.CHARTS?.[slug];
        if (!fn) {
          renderPlaceholder(mountRef.current, name, slug);
          return;
        }

        const width = mountRef.current.clientWidth || 720;
        const height = 420;

        fn({
          mount: mountRef.current,
          width,
          height,
          data: window.VZ_SAMPLE?.[slug],
        });
      } catch (err) {
        console.error("[LiveChart] render failed:", err);
        if (mountRef.current) renderPlaceholder(mountRef.current, name, slug);
      }
    })();

    const onResize = () => {
      if (!mountRef.current) return;
      const fn = window.CHARTS?.[slug];
      if (!fn) return;
      mountRef.current.innerHTML = "";
      fn({
        mount: mountRef.current,
        width: mountRef.current.clientWidth,
        height: 420,
        data: window.VZ_SAMPLE?.[slug],
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [slug, name]);

  return (
    <div className="relative w-full overflow-hidden rounded border border-border bg-bg-1">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-[11px] text-muted">
        <span className="dot-live" />
        <span>Live render · D3 v7</span>
        <span className="ml-auto font-mono">{slug}</span>
      </div>
      <div ref={mountRef} className="w-full min-h-[420px] p-4 guides" />
    </div>
  );
}

function ensureScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.id = id;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

function renderPlaceholder(el: HTMLElement, name: string, slug: string) {
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:380px;gap:10px;text-align:center;">
      <div style="font-family: var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color: var(--muted);">Live render in progress</div>
      <div style="font-family: var(--sans); font-size:18px; font-weight:600; color: var(--text);">${escapeHtml(name)}</div>
      <div style="font-family: var(--mono); font-size:11px; color: var(--muted);">chart source: ${escapeHtml(slug)}</div>
      <div style="margin-top: 8px; font-size:11px; color: var(--text-dim); max-width: 44ch;">
        This chart's runtime bundle will load from our CDN. See the install section below for Looker Studio integration.
      </div>
    </div>
  `;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c] as string);
}
