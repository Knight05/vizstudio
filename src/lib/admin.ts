import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * Admin access is controlled by an email allowlist.
 * Set ADMIN_EMAILS in .env (comma-separated). Falls back to the owner email.
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "brandonlea05@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

/** Server-component guard: redirects non-admins away. */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?next=/vz-ops-37");
  if (!isAdminEmail(session.user.email)) redirect("/dashboard");
  return session.user;
}
