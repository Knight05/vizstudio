import { NextResponse, type NextRequest } from "next/server";

/**
 * Coming-soon mode.
 *
 * Every page route except "/" is redirected to "/" (the coming soon page).
 * What stays live:
 *   - /icons/*        — chart thumbnails for Looker Studio embeds
 *   - /api/*          — API routes (auth, stripe, trpc) keep responding
 *   - /manifest.json  — Looker Studio component manifest
 *   - /favicon.ico, /robots.txt, /sitemap.xml — standard web metadata
 *   - /_next/*        — Next.js framework assets
 *
 * To exit coming-soon mode: delete this file and restore the previous
 * /dashboard auth gate (see git history for the original middleware).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Don't redirect the root itself — that's the coming soon page.
  if (pathname === "/") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Run middleware on every path except whitelisted asset routes.
  // The matcher's negative lookahead is the source of truth — what's NOT
  // listed here gets redirected to "/".
  matcher: [
    "/((?!_next/static|_next/image|icons/|api/|favicon\\.ico|manifest\\.json|robots\\.txt|sitemap\\.xml).*)",
  ],
};
