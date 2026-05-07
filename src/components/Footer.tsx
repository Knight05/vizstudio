import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-1 mt-24">
      <div className="mx-auto grid max-w-page gap-12 px-6 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <rect x="2" y="13" width="4" height="8" rx="1" fill="currentColor" />
              <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" opacity=".7" />
              <rect x="18" y="3" width="4" height="18" rx="1" fill="currentColor" opacity=".45" />
            </svg>
            vizstudio.io
          </div>
          <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-text-dim">
            The most complete D3.js chart library for Google Looker Studio.
            Built by makers who were tired of ugly defaults.
          </p>
        </div>

        <FooterCol title="Product" links={[
          ["Showcase", "/showcase"],
          ["Pricing", "/pricing"],
          ["Changelog", "/changelog"],
          ["Roadmap", "/roadmap"],
        ]} />

        <FooterCol title="Resources" links={[
          ["Docs", "/docs"],
          ["Install guide", "/docs/install"],
          ["API reference", "/docs/api"],
          ["Examples", "/docs/examples"],
        ]} />

        <FooterCol title="Company" links={[
          ["About", "/about"],
          ["Contact", "mailto:hello@vizstudio.io"],
          ["Terms", "/legal/terms"],
          ["Privacy", "/legal/privacy"],
        ]} />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-page items-center justify-between px-6 py-4 text-[11px] text-muted">
          <span>© {new Date().getFullYear()} Viz Studio · vizstudio.io</span>
          <span>Made with D3.js · Powered by OKLCH</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="mb-3 text-[10px] uppercase tracking-widest text-muted">
        {title}
      </h4>
      <ul className="space-y-2 text-[12px] text-text-dim">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-text">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
