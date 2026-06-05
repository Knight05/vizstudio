import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-page items-center gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <rect x="2" y="13" width="4" height="8" rx="1" fill="currentColor" />
            <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" opacity=".7" />
            <rect x="18" y="3" width="4" height="18" rx="1" fill="currentColor" opacity=".45" />
          </svg>
          <span className="tracking-tight">vizstudio.io</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-[12px] text-text-dim">
          <Link href="/showcase" className="hover:text-text">Showcase</Link>
          <Link href="/pricing"  className="hover:text-text">Pricing</Link>
          <Link href="/docs"     className="hover:text-text">Docs</Link>
          <a href="https://github.com/vizstudio-io" className="hover:text-text">GitHub</a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn">Log in</Link>
              <Link href="/signup" className="btn btn-primary">Start free</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
