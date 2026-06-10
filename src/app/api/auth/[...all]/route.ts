import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Catch-all Next.js Route Handler for Better-Auth.
 * Mounts every auth endpoint at /api/auth/* - login, signup, OAuth
 * callbacks, password reset, email verify, sign out, etc.
 */
// Signup triggers GCS bucket provisioning (copy + manifest rewrite),
// which can take longer than the default serverless limit.
export const maxDuration = 60;

export const { GET, POST } = toNextJsHandler(auth);
