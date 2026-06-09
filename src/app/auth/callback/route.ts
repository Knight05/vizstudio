// DEPRECATED: Better-Auth handles its own callbacks at /api/auth/*.
// Kept only so stale links don't 404 - redirects to /login on the same origin.
import { NextRequest, NextResponse } from "next/server";
export const GET = (req: NextRequest) =>
  NextResponse.redirect(new URL("/login", req.nextUrl.origin));
