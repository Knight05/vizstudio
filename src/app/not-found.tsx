import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";

const STYLES = `
.nf-main { min-height: 64vh; display: grid; place-items: center; padding: 72px 24px 88px; }
.nf-card { text-align: center; max-width: 560px; }
.nf-code {
  font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 104px; font-weight: 700;
  letter-spacing: -0.04em; line-height: 1;
  background: var(--accent-grad); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.nf-title { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; margin: 18px 0 10px; color: var(--text); }
.nf-sub { color: var(--text-dim); font-size: 15px; line-height: 1.6; margin: 0 auto 26px; max-width: 46ch; }
.nf-mark { display: block; width: 58px; height: 58px; margin: 0 auto 28px; }
.nf-mark circle { transform-box: view-box; transform-origin: 13px 13px; }
.nf-mark .nf-arc-outer { animation: nf-spin 16s linear infinite; }
.nf-mark .nf-arc-inner { animation: nf-spin 10s linear infinite reverse; }
@keyframes nf-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .nf-mark .nf-arc-outer, .nf-mark .nf-arc-inner { animation: none; } }
.nf-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
`;

export default function NotFound() {
  return (
    <>
      <link rel="stylesheet" href="/assets/style.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap"
      />
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <SiteNav />
      <main className="nf-main">
        <div className="nf-card">
          <div className="nf-code">404</div>
          <h1 className="nf-title">This page doesn&rsquo;t exist. Yet.</h1>
          <p className="nf-sub">
            The page you&rsquo;re looking for moved, was renamed, or never shipped. The 75+ charts
            that did ship are one click away.
          </p>
          <svg className="nf-mark" viewBox="0 0 26 26" fill="none" aria-hidden="true" focusable="false">
            <circle className="nf-arc-outer" cx="13" cy="13" r="11.5" stroke="#3A3F4A" strokeWidth="2.2" strokeDasharray="26 46" strokeDashoffset="-14" />
            <circle className="nf-arc-inner" cx="13" cy="13" r="7.5" stroke="#16181D" strokeWidth="2.2" strokeDasharray="10 37" />
            <circle cx="13" cy="13" r="3.4" fill="#16181D" />
          </svg>
          <div className="nf-row">
            <a className="btn btn-primary" href="/#library">Browse all charts</a>
            <a className="btn" href="/">Back to home</a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
