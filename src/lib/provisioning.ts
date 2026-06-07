import "server-only";
import { prisma } from "./prisma";
import { provisionClientBucket } from "./gcs";

/**
 * Runs after Better-Auth creates a new user (see databaseHooks in auth.ts):
 *
 *   1. Email the user a link to set their password (the real credential setup)
 *   2. Provision a public GCS bucket seeded from the prod bucket
 *   3. Save the bucket name on the user record
 *
 * Email is sent FIRST and in its own try/catch so a slow or failing bucket
 * copy can never starve the credential email — without the set-password link
 * the user can never actually sign in, so it is the higher priority.
 *
 * Never throws — a provisioning failure must not block signup. Errors are
 * logged so they can be retried manually from /admin (bucket also retries on
 * dashboard load).
 */
export async function provisionNewUser(user: {
  id: string;
  email: string;
  name?: string | null;
  company?: string | null;
}): Promise<void> {
  // 1. Password-setup email via Better-Auth's reset flow. Do this first.
  try {
    // Lazy import avoids a circular reference (auth.ts imports this module).
    const { auth } = await import("./auth");
    await auth.api.requestPasswordReset({
      body: { email: user.email, redirectTo: "/reset-password" },
    });
  } catch (err) {
    console.error(`[provisioning] password email failed for ${user.email}:`, err);
  }

  // 2+3. Bucket — skip cleanly if GCP env isn't configured (e.g. local dev).
  if (process.env.GCP_SERVICE_ACCOUNT_EMAIL) {
    try {
      const company = user.company || user.name || user.email.split("@")[0];
      const bucket = await provisionClientBucket(company);
      await prisma.user.update({
        where: { id: user.id },
        data: { gcsBucket: bucket },
      });
    } catch (err) {
      console.error(`[provisioning] bucket setup failed for ${user.email}:`, err);
    }
  } else {
    console.log("[provisioning] GCP env not set — skipping bucket for", user.email);
  }
}
