/**
 * Server-rendered marketing footer, ported from public/assets/partials.js.
 * Pure markup — no client JS needed (the newsletter is a no-op like the static site).
 */
export default function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <a href="/" className="logo">
              <span className="logo-mark inline" aria-hidden="true">
                <img src="/logo.webp" alt="" width={24} height={24} decoding="async" />
              </span>{" "}
              vizstudio
            </a>
            <p>
              The premium chart library for Data Studio teams who care about how
              their data looks.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li><a href="/#features">Features</a></li>
              <li><a href="/#library">Charts</a></li>
              <li><a href="/#pricing">Pricing</a></li>
              <li><a href="/#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              <li><a href="/#how">How it works</a></li>
              <li><a href="/how-to-add-a-chart.html">Add a chart to Data Studio</a></li>
              <li><a href="/#library">Chart library</a></li>
              <li><a href="/suggest.html">Suggest a chart</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="/get-started.html">Get started</a></li>
              <li><a href="/login">Client login</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 Viz Studio LLC · Built for data teams, by data teams.</span>
          <span>
            <a href="/terms.html" style={{ color: "var(--text-dim)" }}>
              Terms of Service
            </a>{" "}
            ·{" "}
            <a href="/privacy.html" style={{ color: "var(--text-dim)" }}>
              Privacy Policy
            </a>
          </span>
          <a href="/" className="logo footer-wordmark">
            <span className="logo-mark inline" aria-hidden="true">
              <img src="/logo.webp" alt="" width={24} height={24} decoding="async" />
            </span>{" "}
            vizstudio
          </a>
        </div>
      </div>
    </footer>
  );
}
