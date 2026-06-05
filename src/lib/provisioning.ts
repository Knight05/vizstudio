import "server-only";
import { prisma } from "./prisma";
import { provisionClientBucket } from "./gcs";

/**
 * Runs after Better-Auth creates a new user (see databaseHooks in auth.ts):
 *
 *   1. Provision a public GCS bucket seeded from the prod bucket
 *   2. Save the bucket name (and company) on the user record
 *   3. Email the user a link to set their password
 *
 * Never throws — a provisioning failure must not block signup. Errors are
 * logged so they can be retried manually from /admin.
 */
export async function provisionNewUser(user: {
  id: string;
  email: string;
  name?: string | null;
  company?: string | null;
}): Promise<void> {
  // 1+2. Bucket — skip cleanly if GCP env isn't configured (e.g. local dev).
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

  // 3. Password-setup email via Better-Auth's reset flow.
  try {
    // Lazy import avoids a circular reference (auth.ts imports this module).
    const { auth } = await import("./auth");
    await auth.api.requestPasswordReset({
      body: { email: user.email, redirectTo: "/reset-password" },
    });
  } catch (err) {
    console.error(`[provisioning] password email failed for ${user.email}:`, err);
  }
}
