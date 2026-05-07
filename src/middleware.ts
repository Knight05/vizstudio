import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight middleware: gate /dashboard routes by checking for a
 * Better-Auth session cookie. We don't decode the token here (that
 * needs Node runtime); we just check presence and bounce to /login.
 * The dashboard server component then does a real getSession() check.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = pathname.startsWith("/dashboard");
  if (!isProtected) return NextResponse.next();

  // Better-Auth uses these cookie names by default.
  const hasSession =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token");

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
