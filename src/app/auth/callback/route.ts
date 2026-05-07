// DEPRECATED: Better-Auth handles its own callbacks at /api/auth/*.
// You can delete the entire src/app/auth/ directory.
import { NextResponse } from "next/server";
export const GET = () => NextResponse.redirect(new URL("/login", "http://localhost"));
