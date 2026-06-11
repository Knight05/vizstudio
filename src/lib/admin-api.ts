import "server-only";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "./auth";
import { isAdminEmail } from "./admin";

/** API-route guard: returns the admin user or a 403 response. */
export async function requireAdminApi(): Promise<
  | { user: { id: string; email: string }; error: null }
  | { user: null; error: NextResponse }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return {
    user: { id: session.user.id, email: session.user.email },
    error: null,
  };
}
