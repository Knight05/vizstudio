import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Catch-all Next.js Route Handler for Better-Auth.
 * Mounts every auth endpoint at /api/auth/* — login, signup, OAuth
 * callbacks, password reset, email verify, sign out, etc.
 */
export const { GET, POST } = toNextJsHandler(auth);
