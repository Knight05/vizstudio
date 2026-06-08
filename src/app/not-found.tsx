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
.nf-bars { display: flex; gap: 6px; justify-content: center; align-items: flex-end; height: 46px; margin-bottom: 28px; }
.nf-bars span { width: 10px; border-radius: 3px; background: var(--accent-grad); opacity: .85; animation: nfb 1.4s ease-in-out infinite alternate; }
.nf-bars span:nth-child(1){height:40%} .nf-bars span:nth-child(2){height:75%;animation-delay:.15s}
.nf-bars span:nth-child(3){height:55%;animation-delay:.3s} .nf-bars span:nth-child(4){height:90%;animation-delay:.45s}
.nf-bars span:nth-child(5){height:30%;animation-delay:.6s}
@keyframes nfb { to { transform: scaleY(0.55); } }
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
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&display=swap"
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
          <div className="nf-bars"><span></span><span></span><span></span><span></span><span></span></div>
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
